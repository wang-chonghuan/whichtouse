# Batch 1 line review

The detail-expansion pass (batch 1, August 2026) briefed each subagent to
verify its category's three published lines *before* elaborating them. Of the
75 lines checked, 31 did not survive as written.

This file is the work list for the correction pass. It is not the correction —
each entry says what is wrong and what the evidence actually supports, and the
rewrite is a separate judgement. Every claim below is stated in the
corresponding `byp_details` entry in `before_you_pick_runs`, with sources.

Nothing here was caught by the validator. It checks length, bare figures and
source URLs — all 31 of these passed it.

## Flatly contradicted by the evidence

| category · line | published claim | what the evidence shows |
|---|---|---|
| coding · avoid | agent PRs wait far longer for review | 28.3% merge in under a minute, 77.5% self-merged by the submitting agent. The review-time blowout is org-wide, not agent-PR-specific. The real risk is unreviewed merges (+31.3%) |
| video-generation · avoid | nothing carries identity between shots | shipped across the field — Sora cameo, Runway character persistence, Kling 3.0 element binding, Seedance 2.0 reference tagging. Contradicted by a source the line itself cites |
| lead-gen · avoid | credits meter attempts; misses still bill | Clay's March 2026 repricing charges nothing on a no-result; FullEnrich and Prospeo publish pay-on-success. The line's closing advice now has the answer "nothing" |
| social-media · avoid | none of the history follows you out | Buffer and Hootsuite both export CSV. It exports fine and *imports* nowhere — and disconnecting a Buffer channel destroys its data unrecoverably, which the line misses |
| image-generation · moving | one-shot is levelling; editing separates models | inverted. Text-to-image arena top ten spans 120 Elo; image-editing spans 38. Editing is the compressed field |
| data-analysis · avoid | verifying by hand costs back the time saved | unmeasured, and "by hand" is the wrong frame — SQLens detects these from database signals, +25.78 F1 over model self-evaluation |
| research-search · weigh | most cannot open paywalled material | leaks both ways. Perplexity retrieved all ten blocked National Geographic excerpts; a licensed partner scored 1/10 |
| meeting-notes · moving | platforms now hold bots at the lobby by default | Teams only. Zoom and Meet have no bot-specific default; their 2026 changes govern their own assistants |
| social-media · moving | collaborators are absorbing into the publishing API | the April 2026 Collaborative Media API only reads and accepts invites. You still cannot set a collaborator at creation |
| architecture-diagram · avoid | the tidying lives nowhere in the source | true of Mermaid, false of Structurizr, which stores layout beside the DSL and re-merges it. The real defect is that the merge matches by name and silently drops positions on rename |

## True of one vendor, published as a category rule

| category · line | the exception that breaks it |
|---|---|
| email-outreach · weigh | mailboxes unlimited at Smartlead and Instantly; lemlist meters senders at 5/user |
| workflow-automation · avoid | Zapier re-bills only on "Entire Zap" replay, not the errored-steps path autoreplay uses; n8n bills per execution regardless of node count |
| ui-design · weigh | causation reversed — the strongest neutral source says the predictor is your design file's structure, not the tool |
| presentation · avoid | evidence is Slidev and Marp, markdown developer tools, not AI deck builders. Gamma's failure is layout fidelity, not flattening |
| browser-automation · moving | record-and-replay ships in developer frameworks (Stagehand), absent from the consumer agent browsers readers compare |
| resume-jobs · moving | Rezi and Enhancv extended into interview rehearsal; Jobscan — the cited source — has no interview product |
| pdf-documents · moving | per-field confidence is not new; Azure Document Intelligence has shipped it for years. The new thing is whether it is *calibrated* |

## Asserted beyond the evidence

| category · line | the problem |
|---|---|
| content-writing · weigh | the "past 1,000 words" threshold is unmeasured; it traces to vendors selling the fix. Academic persona drift measures multi-turn dialogue, not single-pass articles |
| email-outreach · avoid | "providers discount warmup traffic" is documented nowhere. What is documented is enforcement — Google shut down GMass and Saleshandy warmup in 2023 |
| web-scraping · moving | a billion 402s a day are refusals carrying a price, not paid fetches. Cloudflare publishes no figure for crawlers that pay |
| voice-audio · moving | ElevenLabs v3 takes a bracketed tag vocabulary, not plain language, and phoneme precision narrowed rather than moved |
| resume-jobs · weigh | employers do compute scores — Workday HiredScore. The true claim is that the score you see is the vendor's and theirs is invisible |
| pdf-documents · weigh | "before any model sees the page" is false in 2026; the best parsers are themselves vision models |
| browser-automation · weigh | none of the five cited sources supported it. The local-vs-remote axis is a proxy for whether the agent arrives with an accepted session and permitted identity |
| ui-design · avoid | hard-coded colour is a design-system violation, not an accessibility defect — the W4A '25 study found contrast was handled well |
| architecture-diagram · moving | the repo-reading claim rests on an 11-star single-maintainer action. What ships reads Terraform and Pulumi definitions |
| meeting-notes · weigh | summaries as discoverable records is unsettled; the cited source says courts have not squarely decided it |
| meeting-notes · avoid | "clustering guess" describes modular pipelines, not end-to-end neural diarizers, which model overlap directly |
| presentation · moving | direction right, but sourced to a vendor blog grading its own competitors. Re-sourced to Microsoft first-party |
| lead-gen · moving | Clay markets a 40%→78% multi-provider lift; an independent benchmark measured 51%→65%, with the fifth provider adding one point |
| translation · weigh | "prompt-named terms drift" is directional, not absolute — prompt-based refinement scores 98–99% term usage |
| seo-geo · weigh | the 2.2% survival figure measures cited URLs, the least stable layer; brand-mention rate is far more stable |

## What this says about the pipeline

Three failure modes produced most of these, and all three are avoidable in the
first pass rather than the second:

1. **Competitor content read as evidence.** Lead Generation cited two Prospeo
   pages about Clay; Presentations inherited "Gamma flattens everything" from
   four vendors selling native-OOXML alternatives. On a vendor's own billing or
   export behaviour, that vendor's docs outrank any third party.
2. **One vendor generalised to the category.** Seven lines. The research prompt
   asks for a property of the class, and a single well-documented vendor is the
   easiest thing to find — so the generalisation gets made on one example.
3. **Mechanism inferred from an adjacent fact.** Email Outreach inferred
   discounting from enforcement; Data Analysis inferred that verification must
   be manual. Both read as findings.

The prompt should require, per line, that the researcher name the second
independent vendor or study the claim rests on — or mark the line as
vendor-specific.
