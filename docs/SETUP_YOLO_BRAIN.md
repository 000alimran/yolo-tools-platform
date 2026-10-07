# YOLO Brain v0.1 Setup

## Already prepared

- GitHub branch: `phase-1-yolo-brain`
- Initial agent catalog
- YOLO OS architecture and cost guardrails
- Supabase core tables:
  - `yos_agent_runs`
  - `yos_action_queue`
  - `yos_decisions`
  - `yos_briefs`
- Edge Function source at `supabase/functions/yolo-brain/index.ts`

## One secret is required

Create an OpenAI Platform API key and store it as a server-side Supabase Edge Function secret named:

`OPENAI_API_KEY`

Never put this key in:
- Vite environment variables exposed to the browser
- GitHub source files
- frontend JavaScript
- screenshots or shared documentation

## Cost policy

- Default model: `gpt-6-luna`
- Escalation model: `gpt-6-sol`
- Use AI only when judgment or synthesis is required
- Database counts, sums, filtering and deterministic rules should stay in code/SQL

## Next implementation step

1. Deploy the `yolo-brain` Edge Function with JWT verification enabled.
2. Test one routine request.
3. Add a server-side context builder that reads trusted YOLO data.
4. Add the Founder Command Center UI to the existing Vite app.
5. Log each agent run and proposed action.
6. Only after this works, enable Knowledge and Sales agents.

## v0.1 UI

The first screen should contain:

- Business health summary
- Top 3 founder priorities
- Risks / blockers
- Missing data
- Proposed actions requiring approval
- Ask YOLO Brain input

Do not show invented placeholder business numbers in production. Empty or missing data must be clearly labeled as unavailable.
