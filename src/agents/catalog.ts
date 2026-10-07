export type AgentId = 'founder' | 'knowledge' | 'sales' | 'client-success' | 'delivery' | 'finance' | 'content'

export type ModelTier = 'routine' | 'reasoning'

export type AgentDefinition = {
  id: AgentId
  name: string
  mission: string
  defaultModelTier: ModelTier
  enabled: boolean
  approvalRequiredFor: string[]
}

export const agents: AgentDefinition[] = [
  {
    id: 'founder',
    name: 'Founder Agent',
    mission: 'Turn company signals into founder priorities, risks, decisions and next actions without inventing missing facts.',
    defaultModelTier: 'routine',
    enabled: true,
    approvalRequiredFor: ['external communication', 'financial commitment', 'client commitment', 'record deletion'],
  },
  {
    id: 'knowledge',
    name: 'Knowledge Agent',
    mission: 'Find and synthesize trusted internal company knowledge with source awareness.',
    defaultModelTier: 'routine',
    enabled: false,
    approvalRequiredFor: ['document deletion', 'permission changes'],
  },
  {
    id: 'sales',
    name: 'Sales Agent',
    mission: 'Prioritize qualified opportunities and recommend the next best sales action.',
    defaultModelTier: 'routine',
    enabled: false,
    approvalRequiredFor: ['sending outreach', 'discounts', 'proposal pricing', 'contract commitments'],
  },
  {
    id: 'client-success',
    name: 'Client Success Agent',
    mission: 'Detect client risk, delivery gaps and expansion opportunities before they become surprises.',
    defaultModelTier: 'routine',
    enabled: false,
    approvalRequiredFor: ['sending client messages', 'scope changes', 'commercial commitments'],
  },
  {
    id: 'delivery',
    name: 'Delivery Agent',
    mission: 'Surface deadlines, blockers, ownership gaps and execution risk across active work.',
    defaultModelTier: 'routine',
    enabled: false,
    approvalRequiredFor: ['reassigning ownership', 'changing committed deadlines'],
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    mission: 'Explain cash position, receivables and financial risk while leaving transactions to humans.',
    defaultModelTier: 'reasoning',
    enabled: false,
    approvalRequiredFor: ['payments', 'invoice changes', 'financial commitments'],
  },
  {
    id: 'content',
    name: 'Content Agent',
    mission: 'Move content from research to draft to approval while preserving brand context.',
    defaultModelTier: 'routine',
    enabled: false,
    approvalRequiredFor: ['publishing', 'paid promotion'],
  },
]

export const modelPolicy = {
  routine: 'gpt-6-luna',
  reasoning: 'gpt-6-sol',
} as const
