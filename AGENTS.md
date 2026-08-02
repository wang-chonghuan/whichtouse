# AGENTS.md — router

Entry point for AI coding agents on this repo. This is a **thin router**: it holds no
knowledge itself, only behavioral guidelines + where each kind of knowledge lives.
Read the routed file directly; don't duplicate its content here.

## Session bootstrap (do this first)

Before planning, editing, changing runtime state, or creating tickets: read and
follow **`n-prodfarm/SESSION-BOOTSTRAP.md`** (in the installed n-prodfarm skill —
`~/.claude/skills/n-prodfarm/SESSION-BOOTSTRAP.md`) against the current working
directory. It loads this router, the charter, the module docs and the ticket/batch
state, and routes the task to exactly one n-prodfarm capability.

## Behavioral baseline

- Follow the engineering rules in `.prodfarm/charter/engineering-rules.md` (think-before-coding, simplicity, surgical changes, SSOT, verify-by-running, honesty over throughput).
- **Ticket-first**: no product code/content/config/runtime change without an in-progress backend ticket. Route per the n-prodfarm Entry Routing table (develop an existing ticket → cap9 → cap6; no ticket yet → cap5/cap8; chore → cap10).
- This repo runs the **n-prodfarm** product-autonomy loop: human decides at batch boundaries; the machine executes inside a batch. `.prodfarm/charter/` is **frozen inside a batch** — propose charter changes as boundary settlement, never edit mid-batch.
- Verify by actually running the product (browser / runbook commands), never by imagining from code.

## Where knowledge lives

| Question | Home |
|---|---|
| Product goal / north star | `.prodfarm/charter/goal.md` (human-only) |
| Hard boundaries needing human approval | `.prodfarm/charter/redlines.md` |
| Engineering norms a coder must obey | `.prodfarm/charter/engineering-rules.md` |
| Architecture decisions + stack & constraints | `.prodfarm/charter/architecture.md` |
| Dev / build / test / deploy / ops commands | `.prodfarm/charter/runbook.md` |
| What happened (dev timeline) | `.prodfarm/timeline/` |
| Batch archives (story list, grill, report) | `.prodfarm/batches/` |
| Machine-current module facts (reverse-engineered) | `.evodocs/modules/` |
| Ticket spec / test basis | the ticket in the backend (plane, project WHICHTOUSE) |
| Full product intent + market research | `resources/reference/PRODUCT-GOAL.md` + `MARKET-RESEARCH.md` |
| UI design tokens & rules | `app/src/theme/neutralTheme.ts` (the whole look, as tokens) + `npx @astryxdesign/cli docs` |
| DB schema (SSOT) | `ssot-schemas/db-schemas/whichtouse.sql` |
