import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronLeft,
  FileAudio,
  Globe2,
  HeartPulse,
  Mail,
  Menu,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  X,
} from 'lucide-react'

type ToolAction = 'sales' | 'calculator'
type Tool = {
  title: string
  description: string
  category: string
  icon: 'sales' | 'web' | 'brand' | 'doctor'
  action?: ToolAction
  status?: string
}

type Analysis = {
  overall: number
  outcome: string
  summary: string
  customerIntent: 'Hot' | 'Warm' | 'Cold'
  scores: { label: string; score: number; note: string }[]
  objections: string[]
  missedOpportunities: string[]
  coaching: string[]
  nextResponse: string
}

const tools: Tool[] = [
  {
    title: 'Sales Call Intelligence',
    description: 'Turn Bangla, Banglish or English sales conversations into scorecards, objections, missed opportunities and the next best response.',
    category: 'Revenue Intelligence',
    icon: 'sales',
    action: 'sales',
  },
  {
    title: 'Website Cost Calculator',
    description: 'Get a realistic investment range, timeline and the right technology for your next website.',
    category: 'Web & Product',
    icon: 'web',
    action: 'calculator',
  },
  {
    title: 'Brand Health Score',
    description: 'Measure clarity, consistency, trust and growth readiness across your brand.',
    category: 'Brand Strategy',
    icon: 'brand',
    status: 'Coming next',
  },
  {
    title: 'Doctor Digital Presence Score',
    description: 'Find the gaps costing your practice patient trust, visibility and appointments.',
    category: 'Healthcare Growth',
    icon: 'doctor',
    status: 'Coming next',
  },
]

const formats = [
  { id: 'business', label: 'Business website', base: 65000, desc: 'A polished company or service website' },
  { id: 'ecommerce', label: 'E-commerce store', base: 105000, desc: 'Products, payments and order management' },
  { id: 'platform', label: 'Web platform', base: 175000, desc: 'Accounts, dashboards and custom workflows' },
]

const featurePrices: Record<string, number> = { cms: 18000, booking: 24000, payment: 28000, multilingual: 22000, automation: 35000 }
const featureLabels: Record<string, string> = {
  cms: 'Easy content management',
  booking: 'Booking or appointments',
  payment: 'Online payment',
  multilingual: 'Multiple languages',
  automation: 'CRM & automation',
}

const demoTranscript = `Salesperson: Assalamu alaikum, apni amader dental aligner niye form fill-up korechilen. Ekhon kotha bola jabe?
Customer: Ji, bolen. Mainly price ta jante chacchilam.
Salesperson: Sure. Apnar age koto, ar teeth alignment niye main concern ta ki?
Customer: Amar samner duita daat ektu baka. Office e client meeting hoy, tai visible braces chai na.
Salesperson: Bujhte parchi. Clear aligner apnar case e suitable hote pare, but doctor assessment lagbe. Budget niye ki kono range mathay ache?
Customer: 1 lakh er beshi hole difficult.
Salesperson: Amader package normally case complexity onujayi vary kore. Apni clinic e ekbar consult korle doctor exact plan dite parbe.
Customer: Thik ache, ami dekhi.
Salesperson: Okay, kono proshno thakle janaben.
Customer: Achha.`

function Icon({ kind }: { kind: Tool['icon'] }) {
  const C = kind === 'sales' ? PhoneCall : kind === 'web' ? Globe2 : kind === 'brand' ? BarChart3 : HeartPulse
  return <C size={23} />
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function localAnalyze(transcript: string): Analysis {
  const t = transcript.toLowerCase()
  const hasQuestion = /\?|কেন|কি |কী |কতো|কত |how|what|why|when|budget|problem|concern|goal/.test(t)
  const hasNeed = /need|চাই|চাচ্ছি|concern|problem|সমস্যা|goal|visible|urgent|দরকার/.test(t)
  const hasBudget = /budget|price|দাম|টাকা|lakh|লাখ|cost/.test(t)
  const hasObjection = /বেশি|expensive|difficult|think|দেখি| পরে|later|budget/.test(t)
  const hasNextStep = /appointment|booking|book|meeting|consult|visit|tomorrow|কাল|date|time|schedule/.test(t)
  const hasClose = /confirm|fixed|booked|see you|দেখা হবে|কখন আসবেন|slot|সময়/.test(t)
  const questions = (transcript.match(/\?/g) || []).length

  const discovery = clamp(52 + (hasQuestion ? 16 : 0) + (hasNeed ? 12 : 0) + Math.min(12, questions * 3))
  const need = clamp(48 + (hasNeed ? 26 : 0) + (hasQuestion ? 8 : 0))
  const objection = clamp(44 + (hasObjection ? 14 : 0) + (hasBudget ? 10 : 0) + (hasNextStep ? 7 : 0))
  const closing = clamp(34 + (hasNextStep ? 22 : 0) + (hasClose ? 24 : 0))
  const clarity = clamp(62 + (transcript.length > 350 ? 8 : 0) + (questions > 1 ? 8 : 0))
  const overall = Math.round((discovery + need + objection + closing + clarity) / 5)

  const objections = []
  if (hasBudget) objections.push('Price / budget sensitivity detected')
  if (/দেখি|think|later|পরে/.test(t)) objections.push('Customer delayed commitment instead of choosing a concrete next step')
  if (!objections.length) objections.push('No strong explicit objection detected')

  const missedOpportunities = []
  if (!hasNextStep) missedOpportunities.push('No specific appointment, meeting or follow-up was proposed')
  if (!hasClose) missedOpportunities.push('The call ended without a confirmed date, time or commitment')
  if (!/value|benefit|result|outcome|visible|comfort|সময় বাঁচ|benefit/.test(t)) missedOpportunities.push('Value was not connected strongly enough to the customer’s stated need')
  if (hasBudget && !/installment|payment plan|option|package|range/.test(t)) missedOpportunities.push('Budget objection appeared, but no payment or package option was explored')

  const intent: Analysis['customerIntent'] = hasNeed && hasBudget ? 'Warm' : hasNeed ? 'Warm' : 'Cold'

  return {
    overall,
    outcome: hasClose ? 'Next step confirmed' : hasNextStep ? 'Interested, but not fully closed' : 'Conversation ended without commitment',
    summary: hasNeed
      ? 'The salesperson uncovered a real need, but the conversation needed a stronger value bridge and a concrete close.'
      : 'The conversation needs deeper discovery before pitching or discussing price.',
    customerIntent: intent,
    scores: [
      { label: 'Discovery', score: discovery, note: hasQuestion ? 'Relevant questions were asked.' : 'Ask more diagnostic questions before pitching.' },
      { label: 'Need understanding', score: need, note: hasNeed ? 'A customer need is visible in the conversation.' : 'The core problem remains unclear.' },
      { label: 'Objection handling', score: objection, note: hasObjection ? 'An objection surfaced, but it could be worked more deliberately.' : 'No major objection surfaced.' },
      { label: 'Closing', score: closing, note: hasClose ? 'A specific commitment was secured.' : 'The call needed a date, time or defined next action.' },
      { label: 'Clarity', score: clarity, note: 'Conversation flow is understandable and manager-review friendly.' },
    ],
    objections,
    missedOpportunities,
    coaching: [
      'Repeat the customer’s pain in their own words before explaining the offer.',
      'When price resistance appears, quantify value before discussing discounts.',
      'Never end with “let me know”. Offer two concrete next-step options instead.',
    ],
    nextResponse: 'আপনার concernটা বুঝতে পারছি। আপনি যেহেতু visible braces চান না এবং budget-ও important, doctor assessment-এর পর আমরা suitable option আর exact range clear করতে পারব। আগামীকাল 6:30 PM নাকি পরশু 5:00 PM, কোন slotটা আপনার জন্য better?',
  }
}

export function App() {
  const [menu, setMenu] = useState(false)
  const [calculator, setCalculator] = useState(false)
  const [salesIntel, setSalesIntel] = useState(false)

  const openTool = (action?: ToolAction) => {
    if (action === 'sales') setSalesIntel(true)
    if (action === 'calculator') setCalculator(true)
  }

  return (
    <>
      <header>
        <a className="brand" href="#"><span className="brandmark">Y</span><span>YOLO <b>TOOLS</b></span></a>
        <nav className={menu ? 'open' : ''}>
          <a href="#tools">All tools</a><a href="#method">How it works</a><a href="https://theyolostudio.com">YOLO Studio</a>
          <button className="navCta" onClick={() => setSalesIntel(true)}>Analyze a sales call <ArrowRight size={16} /></button>
        </nav>
        <button className="menu" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> Free tools for sharper decisions</div>
          <h1>Know what to do<br /><em>before you spend.</em></h1>
          <p>Practical business tools that turn uncertainty into a clear next move. Built for founders, marketers and ambitious teams.</p>
          <div className="heroActions">
            <button className="primary" onClick={() => setSalesIntel(true)}>Analyze a sales call <ArrowRight size={18} /></button>
            <a href="#tools">Explore all tools</a>
          </div>
          <div className="proof"><span><Check /> Free to try</span><span><Check /> Bangla + Banglish ready</span><span><Check /> Actionable coaching</span></div>
          <div className="orb"><div className="score"><small>CALL QUALITY SCORE</small><strong>84</strong><span>Coach the close</span></div></div>
        </section>

        <section className="toolsSection" id="tools">
          <div className="sectionHead"><div><span className="kicker">THE TOOLKIT</span><h2>Small tools.<br />Serious clarity.</h2></div><p>Each tool solves one focused business question and gives you a useful answer in minutes.</p></div>
          <div className="toolGrid">
            {tools.map((tool, i) => <article className="toolCard" key={tool.title}>
              <div className="toolTop"><span className="toolIcon"><Icon kind={tool.icon} /></span><span className="number">0{i + 1}</span></div>
              <span className="category">{tool.category}</span><h3>{tool.title}</h3><p>{tool.description}</p>
              {tool.status ? <span className="soon">{tool.status}</span> : <button onClick={() => openTool(tool.action)}>Open tool <ArrowRight size={17} /></button>}
            </article>)}
          </div>
        </section>

        <section className="method" id="method">
          <div><span className="kicker">HOW IT WORKS</span><h2>From conversation to<br /><em>coachable action.</em></h2></div>
          <ol>
            <li><b>01</b><span><strong>Upload or paste</strong>Add a sales-call recording or transcript.</span></li>
            <li><b>02</b><span><strong>AI reviews the call</strong>Discovery, objections, closing and buyer intent are scored.</span></li>
            <li><b>03</b><span><strong>Coach the next move</strong>See missed opportunities and the exact response to send next.</span></li>
          </ol>
        </section>

        <section className="closing"><span className="kicker">BUILT BY THE YOLO STUDIO</span><h2>Better conversations create<br /><em>better revenue.</em></h2><p>We turn brand, technology and growth problems into clear digital experiences.</p><a href="https://theyolostudio.com">Visit The YOLO Studio <ArrowRight size={18} /></a></section>
      </main>

      <footer><div className="brand"><span className="brandmark">Y</span><span>YOLO <b>TOOLS</b></span></div><span>Useful thinking, made tangible.</span><small>© 2026 The YOLO Studio</small></footer>
      {calculator && <Calculator close={() => setCalculator(false)} />}
      {salesIntel && <SalesCallIntelligence close={() => setSalesIntel(false)} />}
    </>
  )
}

function SalesCallIntelligence({ close }: { close: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<'ai' | 'local' | null>(null)

  const runAnalysis = async () => {
    setError('')
    setLoading(true)
    setAnalysis(null)
    let workingTranscript = transcript.trim()

    try {
      if (!workingTranscript && file) {
        const formData = new FormData()
        formData.append('file', file)
        const transcriptionResponse = await fetch('/api/transcribe', { method: 'POST', body: formData })
        if (!transcriptionResponse.ok) throw new Error('Audio transcription is not configured yet. Paste a transcript to use the MVP now.')
        const transcriptionData = await transcriptionResponse.json() as { transcript?: string }
        workingTranscript = transcriptionData.transcript?.trim() || ''
        setTranscript(workingTranscript)
      }

      if (!workingTranscript) throw new Error('Upload a call recording or paste a transcript first.')

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: workingTranscript }),
        })
        if (!response.ok) throw new Error('AI endpoint unavailable')
        const result = await response.json() as Analysis
        setAnalysis(result)
        setSource('ai')
      } catch {
        setAnalysis(localAnalyze(workingTranscript))
        setSource('local')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyze this call.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="modal salesModal"><div className="salesPanel">
    <div className="calcHead"><div><span>YOLO REVENUE INTELLIGENCE</span><strong>Sales Call Intelligence</strong></div><button onClick={close}><X /></button></div>

    {!analysis ? <div className="salesInput">
      <div className="salesIntro"><span className="step">CALL REVIEW MVP</span><h2>What happened on the call?</h2><p>Upload the recording or paste a transcript. Bangla, Banglish and English are supported in the analysis workflow.</p></div>

      <label className="uploadZone">
        <input type="file" accept="audio/*,.mp3,.m4a,.wav,.webm" onChange={e => setFile(e.target.files?.[0] || null)} />
        <span className="uploadIcon"><Upload /></span>
        <strong>{file ? file.name : 'Drop or choose a call recording'}</strong>
        <small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB selected` : 'MP3, M4A, WAV or WebM'}</small>
      </label>

      <div className="orDivider"><span>OR PASTE TRANSCRIPT</span></div>
      <textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Salesperson: Assalamu alaikum...\nCustomer: Ji, bolen..." />
      <div className="demoRow"><button className="textButton" onClick={() => setTranscript(demoTranscript)}><FileAudio size={16} /> Load demo transcript</button><span><ShieldCheck size={15} /> Keep consent and call-recording laws in mind.</span></div>
      {error && <div className="errorBox">{error}</div>}
      <button className="analyzeButton" onClick={runAnalysis} disabled={loading}>{loading ? <><span className="spinner" /> Analyzing call...</> : <><BrainCircuit size={18} /> Analyze sales call <ArrowRight size={18} /></>}</button>
    </div> : <div className="analysisWrap">
      <div className="analysisHero">
        <div><span className="step">CALL SCORECARD</span><h2>{analysis.overall}<small>/100</small></h2><p>{analysis.summary}</p></div>
        <div className="intentCard"><small>BUYER INTENT</small><strong>{analysis.customerIntent}</strong><span>{analysis.outcome}</span></div>
      </div>

      <div className="scoreGrid">{analysis.scores.map(item => <div className="metric" key={item.label}><div><strong>{item.label}</strong><b>{item.score}</b></div><span><i style={{ width: `${item.score}%` }} /></span><p>{item.note}</p></div>)}</div>

      <div className="analysisColumns">
        <section><div className="miniHead"><Target size={17} /><strong>Objections detected</strong></div>{analysis.objections.map(x => <p key={x}>• {x}</p>)}</section>
        <section><div className="miniHead"><MessageSquareText size={17} /><strong>Missed opportunities</strong></div>{analysis.missedOpportunities.map(x => <p key={x}>• {x}</p>)}</section>
      </div>

      <section className="coachBox"><div className="miniHead"><BrainCircuit size={18} /><strong>Manager coaching notes</strong></div>{analysis.coaching.map((x, i) => <div className="coachItem" key={x}><span>0{i + 1}</span><p>{x}</p></div>)}</section>

      <section className="nextReply"><span className="step">NEXT BEST RESPONSE</span><p>{analysis.nextResponse}</p></section>

      <div className="analysisFooter"><span>{source === 'ai' ? 'AI analysis' : 'Local MVP fallback analysis'} · Review before using for performance decisions.</span><div><button className="textButton" onClick={() => { setAnalysis(null); setSource(null) }}>Analyze another</button><button className="darkButton" onClick={() => navigator.clipboard?.writeText(analysis.nextResponse)}><Check size={16} /> Copy response</button></div></div>
    </div>}
  </div></div>
}

function Calculator({ close }: { close: () => void }) {
  const [step, setStep] = useState(1), [format, setFormat] = useState('business'), [pages, setPages] = useState(6), [features, setFeatures] = useState<string[]>([]), [timeline, setTimeline] = useState('standard'), [email, setEmail] = useState(''), [sent, setSent] = useState(false)
  const result = useMemo(() => {
    const base = formats.find(x => x.id === format)!.base
    const extras = features.reduce((s, f) => s + featurePrices[f], 0)
    const pageCost = Math.max(0, pages - 5) * 4500
    const rush = timeline === 'rush' ? 1.25 : 1
    const mid = (base + extras + pageCost) * rush
    return { low: Math.round(mid * .88 / 1000) * 1000, high: Math.round(mid * 1.15 / 1000) * 1000, weeks: timeline === 'rush' ? '3–5' : '6–10' }
  }, [format, pages, features, timeline])
  const toggle = (f: string) => setFeatures(v => v.includes(f) ? v.filter(x => x !== f) : [...v, f])

  return <div className="modal"><div className="calc"><div className="calcHead"><div><span>YOLO TOOLS</span><strong>Website Cost Calculator</strong></div><button onClick={close}><X /></button></div><div className="progress"><i style={{ width: `${step * 25}%` }} /></div><div className="calcBody">
    {step === 1 && <><span className="step">STEP 1 OF 4</span><h2>What are we building?</h2><p>Choose the closest fit. You can refine everything later.</p><div className="choices">{formats.map(x => <button className={format === x.id ? 'selected' : ''} onClick={() => setFormat(x.id)} key={x.id}><span>{x.label}</span><small>{x.desc}</small>{format === x.id && <Check />}</button>)}</div></>}
    {step === 2 && <><span className="step">STEP 2 OF 4</span><h2>What does it need to do?</h2><p>Select every feature that matters now.</p><div className="checks">{Object.entries(featureLabels).map(([id, label]) => <label className={features.includes(id) ? 'checked' : ''} key={id}><input type="checkbox" checked={features.includes(id)} onChange={() => toggle(id)} /><span>{label}</span><Check /></label>)}</div><label className="range"><span>Estimated pages <b>{pages}</b></span><input type="range" min="3" max="30" value={pages} onChange={e => setPages(+e.target.value)} /></label></>}
    {step === 3 && <><span className="step">STEP 3 OF 4</span><h2>How quickly do you need it?</h2><p>A compressed timeline usually needs a larger dedicated team.</p><div className="choices"><button className={timeline === 'standard' ? 'selected' : ''} onClick={() => setTimeline('standard')}><span>Standard timeline</span><small>Quality-focused delivery in 6–10 weeks</small></button><button className={timeline === 'rush' ? 'selected' : ''} onClick={() => setTimeline('rush')}><span>Priority delivery</span><small>Dedicated sprint team in 3–5 weeks</small></button></div></>}
    {step === 4 && <div className="result"><span className="step">YOUR ESTIMATE</span><h2>BDT {result.low.toLocaleString()} – {result.high.toLocaleString()}</h2><p>A strategic estimate based on your selected scope. Final pricing follows a focused discovery session.</p><div className="resultMeta"><span><small>DELIVERY</small><b>{result.weeks} weeks</b></span><span><small>RECOMMENDED</small><b>{format === 'ecommerce' ? 'Shopify / Custom' : 'Modern custom build'}</b></span></div>{sent ? <div className="sent"><Check /><span><b>Report request saved</b>We will enable automatic delivery when email service launches.</span></div> : <form onSubmit={e => { e.preventDefault(); setSent(true) }}><label><Mail size={17} /><input required type="email" placeholder="Email for the detailed report" value={email} onChange={e => setEmail(e.target.value)} /></label><button>Send my report <ArrowRight size={17} /></button></form>}<small className="privacy">No spam. Your details stay with The YOLO Studio.</small></div>}
  </div><div className="calcFoot">{step > 1 && <button className="back" onClick={() => setStep(step - 1)}><ChevronLeft size={17} /> Back</button>}<span />{step < 4 && <button className="next" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={17} /></button>}</div></div></div>
}
