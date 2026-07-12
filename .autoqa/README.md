# AutoQA

`.autoqa/` contains AI-assisted Playwright tests and shared test infrastructure for this repo. It is separate from product code and from `.t2p/` ticket evidence.

## Layout

- `fixtures/`: shared Playwright fixtures. Use these instead of repeating setup steps in specs.
- `libs/`: shared AutoQA helpers that are not fixtures.
- `shared-df/`: verify-only public/read-only preconditions and fingerprints.
- `rg-cases/`: formal durable regression cases.
- `rg-candidates/`: draft regression case candidates.
- `tickets/<TICKET-ID>/ac-cases/`: formal ticket acceptance cases.
- `tickets/<TICKET-ID>/ac-candidates/`: draft ticket acceptance cases.
- `ssot-config.json`: repo-local AutoQA runtime configuration.

## Current Fixture

Use `azureLoggedInPage` from `fixtures/auth.ts` when a case needs an authenticated app page.

```ts
import { expect, test } from '../fixtures/auth'

test('example', async ({ azureLoggedInPage }) => {
  await expect(azureLoggedInPage).toHaveURL(/\/coach$/)
})
```

This fixture performs the real Azure / CIAM UI login. Do not replace it with direct token injection for cases that depend on login coverage.

## Run

Prerequisite for frontend cases: the local backend and frontend are running.
Start them with the project's documented dev commands; `ssot-config.json`
environments name the expected local `baseURL`/`backendURL`. Record the
exact startup commands for this repo here after initialization.

Run frontend-only legacy regression cases directly with Playwright:

```bash
npx playwright test .autoqa/rg-cases --project=chrome
```

For mixed RG cases created by capability 11/12, use n-autoqa capability 3 so the run honors `meta.json`, verifies public preconditions, reconciles owner snapshots and cleanup journals, and applies the classification-specific lifecycle in `libs/df_runner.py`.

## Requirements

- Browser project must use system Chrome: `channel: 'chrome'`.
- Existing public data is test basis, not fixture data. Pure public-read cases use verify-only `shared-df/` preconditions and have no case-local `df/`.
- Owner fixtures are declarative and refer to a configured logical `principalRef`; raw owner ids are forbidden. Process prep uses configured `processRef` values, never case-supplied commands. Temporary public creation is exceptional and requires an allowlisted resource, a unique high-entropy cleanup key, adapter-proven insert-only creation, and the crash-safe cleanup journal.
- The per-repo `libs/db_adapter.py` owns principal verification and allowlisted cleanup-resource lookup/delete. Cases never carry setup/reset code, SQL, table names, or delete commands.
- Semantic-gate assertions call `libs/llm_check.py`, configured by `ssot-config.json.semanticCheck`; an unavailable judge is an infrastructure failure, never a silent skip.
- Do not run automated regression and manual testing on the shared test account at the same time; scheduled jobs that write the test account's scope must be excluded or scheduled apart. Record the repo-specific conventions here.
- Do not move AutoQA specs into app directories.
- Do not duplicate login steps inside specs; use `azureLoggedInPage`.
- Generated tests must follow the case layout in the n-autoqa layout contract.
- PTA Planner / Generator / Healer work must run through OpenCode or Claude Code.
- Codex must not be used as a PTA host; rerun PTA-required steps in OpenCode or Claude Code.

## Skills

- `n-autoqa`: repo initialization, AutoQA structure, Playwright/PTA prerequisites.
- `n-toaskill`: used when changing the n-autoqa skill design itself.
- `n-git`: required for branch sync, commit, and push workflow.
