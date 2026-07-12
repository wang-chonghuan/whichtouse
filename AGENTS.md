# AGENTS.md — router

Entry point for AI coding agents on this repo. This is a **thin router**: it holds no
knowledge itself, only behavioral guidelines + where each kind of knowledge lives.
Read the routed file directly; don't duplicate its content here.

## Behavioral baseline

- Follow the engineering rules in `.prodfarm/charter/engineering-rules.md` (think-before-coding, simplicity, surgical changes, SSOT, verify-by-running, honesty over throughput).
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
| UI design tokens & rules | `resources/reference/DESIGN.md` (+ `DESIGN.guide.md`) |
| DB schema (SSOT) | `ssot-schemas/db-schemas/whichtouse.sql` |
