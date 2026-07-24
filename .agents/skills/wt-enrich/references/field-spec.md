# wt-enrich field spec + worked examples

Read this when you need the exact per-field rules, the JSON shape, or a reference output.

## JSON shape (added to each item, alongside existing fields)

```jsonc
{
  // ...existing: rank, name, homepage, pricing, bestFor, confidence, badge, sources, kind
  "rankBasis": "string — concrete, cites real signals",
  "pricingFree": "string | null",
  "pricingPaid": "string | null",
  "features": ["2-4 short phrases"],
  "pros": ["2-3 strengths from real reviews"],
  "cons": ["2-3 limitations from real reviews"]
}
```

## Field rules

### rankBasis
One sentence. Must name at least one CONCRETE signal, ideally several:
- average / typical position across major "best <use case> 2026" roundups ("consistently #1–2 across…"),
- GitHub stars (for OSS) with the rough number,
- G2 / Capterra rating **and review count** (a 4.9 from 12 reviews ≠ a 4.6 from 500),
- Reddit / community mention volume or being "the most-cited X".
Forbidden: "it's the best", "high quality", or restating the derived score. If signals are thin,
say so honestly ("newer entrant, limited independent review volume").

### pricingFree / pricingPaid
From the OFFICIAL pricing page only. `pricingFree` = the standing free plan with its concrete limit
(credits/rows/seats), or `null` if there is genuinely no free plan (trials do not count as a free
plan — note "trial-only" and set null). `pricingPaid` = the cheapest commonly-used paid tier with
**both** the price and what it grants. If the vendor publishes no number (consumption-based /
sales-led), write `"Paid tiers available"` or `"Consumption-based (no public rate)"` — never invent
a figure. OSS: `pricingFree = "Free & open-source (self-host)"`, `pricingPaid = null` unless a real
hosted cloud tier exists (e.g. Firecrawl Cloud).

### features
2–4 of the tool's MAIN capabilities, short noun phrases from the official site. Not marketing fluff.

### pros / cons
2–3 each, drawn from aggregated third-party sentiment (G2, Capterra, Reddit, independent roundups) —
what real users and reviewers actually say. `cons` must be real, specific limitations, not soft
"could be better" filler. This is consensus, not our own hands-on test; the UI labels it as such.

## Worked example 1 — SaaS app (Firecrawl, web-scraping app track)

```json
{
  "rankBasis": "Consistently ranks #1-2 across 2026 AI-scraping roundups (Bright Data, ScrapeOps, Apify comparisons); its open-source core is among the most-starred AI scrapers (~150k★) and it is the most-cited 'LLM-ready' scraper in r/webscraping discussion.",
  "pricingFree": "Free tier: 1,000 credits/mo (2 concurrent requests)",
  "pricingPaid": "Hobby $16/mo (billed yearly) — 5,000 credits/mo",
  "features": ["URL → clean Markdown/JSON in one call", "schema-defined structured extraction", "JS rendering & full-site crawling", "LLM/RAG-ready output"],
  "pros": ["default choice for AI/RAG pipelines — clean, token-efficient output", "simple API, very fast to integrate", "open-source core plus a managed cloud"],
  "cons": ["credits don't roll over; extract/large crawls burn them fast", "can struggle on the hardest anti-bot targets", "costs climb quickly at scale"]
}
```

## Worked example 2 — OSS repo (Crawl4AI, web-scraping skill track)

```json
{
  "rankBasis": "The recognized king of open-source AI/LLM scraping — ~75k★, the tool r/webscraping most often recommends over paid scrapers, and top of most 'open-source scraper' roundups.",
  "pricingFree": "Free & open-source (self-host)",
  "pricingPaid": null,
  "features": ["LLM-ready markdown extraction", "async high-throughput crawling", "adaptive/heuristic content extraction", "browser automation with stealth"],
  "pros": ["free and self-hostable — no per-page credits", "purpose-built for feeding LLMs/RAG", "very active project, fast-moving community"],
  "cons": ["you run and scale the infra yourself", "no managed proxies/anti-bot out of the box", "steeper setup than a hosted API"]
}
```

## Notes carried from the reference build

- Prices verified live from vendor pages (Jul 2026): Firecrawl free 1,000 credits/mo, Hobby
  $16/mo–5,000 credits; Apify free $5 credits/mo; Diffbot free 10k credits, Startup $299/mo.
- Bright Data and Kadoa had no verifiable flat entry price → marked consumption-based, no invented
  number. Bright Data has no standing free plan (trial-only) → `pricingFree: null`.
