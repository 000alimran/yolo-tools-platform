# YOLO OS v0.1

## Goal
Build a low-cost internal operating layer for The YOLO Studio that helps the founder see priorities, risks, missing information and recommended next actions from one place.

## v0.1 Scope

We start with one useful agent, not a swarm.

### Founder Agent
The Founder Agent should answer questions such as:
- What needs my attention today?
- Which leads need action?
- Which client or delivery risks are emerging?
- What information is missing before I make a decision?
- What are the next three actions I should take?

### YOLO Brain API
A secure server-side AI endpoint. The browser must never receive the OpenAI API key.

### Data sources
Reuse existing systems before creating new tables.
- Supabase `public.tyl_clients`
- Supabase `public.tyl_leads`
- Supabase `public.studio_members`
- ClickUp later for tasks and delivery
- Google Drive later for knowledge
- Gmail and Calendar later for communication and meetings

## Cost Guardrails

1. Reuse the existing Supabase project instead of creating another project.
2. Keep the existing Vite + React frontend until it becomes a real limitation.
3. Use GPT-6 Luna for routine classification, summaries and routing.
4. Escalate to GPT-6 Sol only for important decisions or complex synthesis.
5. Never call AI for deterministic calculations or database queries.
6. Cache reusable summaries where practical.
7. No autonomous paid actions in v0.1.
8. No message sending, ad spending, contract changes or financial transactions without explicit human approval.

## Architecture

```text
Vite + React UI
      |
      v
YOLO Brain Edge Function
      |
      +--> Existing Supabase data
      |
      +--> OpenAI Responses API
      |
      +--> Future tools: ClickUp / Drive / Gmail / Calendar
```

## Model Policy

### Default
`gpt-6-luna`

Use for:
- routing
- summaries
- extracting actions
- lead classification
- daily briefs
- status interpretation

### Escalation
`gpt-6-sol`

Use only for:
- founder-level strategic decisions
- complex multi-source synthesis
- high-ambiguity recommendations
- final review of important business decisions

## Data Principle

One source of truth. Agents do not create duplicate copies of clients, leads or team members unless a sync cache is explicitly required.

New YOLO OS storage should be limited to agent-specific state such as:
- agent runs
- decision log
- action queue
- source sync state
- generated briefs
- approval state

## Human Approval Rules

The following always require approval:
- sending external email or messages
- changing prices or discounts
- committing ad spend
- contracts
- payments
- deleting records
- changing client commitments

## Definition of Done for v0.1

A founder can open YOLO OS and:
1. Ask a business question.
2. Receive a concise answer grounded in available company data.
3. See what data is missing instead of receiving fabricated assumptions.
4. Get a ranked list of recommended next actions.
5. Run the system at near-zero infrastructure cost, with model usage as the main variable cost.
