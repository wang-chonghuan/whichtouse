# purpose

The GitHub Trending module powers the home-page repository feed and converts a short-lived popularity signal into the richer product-detail contract used elsewhere in WhichToUse. It fetches and parses Trending, classifies repositories into site use cases, researches selected repositories through GitHub APIs, merges curated human research where available, and isolates external failures from the rest of the site.

# structure

The list path consists of a server function and a narrow HTML parser. The server function fetches `github.com/trending` with an eight-second timeout and caches successful results for fifteen minutes. The parser splits repository article blocks, extracts repository identity, description, language, total stars, and daily growth, decodes basic HTML entities, and assigns a category.

The detail path validates the client-supplied repository summary before using it. Validation constrains the repository name shape, rank, text fields, and category length, and reconstructs the canonical GitHub URL rather than trusting an arbitrary input URL.

Repository research fetches metadata, raw README text, and highly commented open issues concurrently. Each request has an independent timeout and returns a neutral null or empty value on failure. A twelve-hour detail cache limits repeated GitHub traffic, while a pending-promise map ensures simultaneous requests for the same repository share one research operation.

Enrichment owns category rules, README feature extraction, pricing/license wording, adoption signals, strengths, limitations, and sources. A curated review map can override generated fields for repositories that have received deeper research. The generated base still supplies identity and compatible defaults.

# flows

When the home route loads, the list server function returns a cached successful snapshot or fetches current Trending HTML. If GitHub responds unsuccessfully, markup yields no repositories, or the request fails, the function returns an empty list with a temporary-unavailability message and does not make category browsing fail.

Parsing is deliberately small and deterministic. Each valid article becomes a ranked repository, and rank is based on parsed order. Initial categorization uses repository name, description, and language.

When a reader selects a repository, the detail server function validates the summary and checks the long-lived cache. On a miss it starts one shared request, obtains available metadata, README, and issues, then classifies again using richer topics and README evidence. Feature extraction searches named feature/capability sections for useful bullets, followed by description, topic, language, and category fallbacks.

The generated detail item explains rank using Trending position, daily stars, total adoption, forks, and recency. Open non-pull-request issues with the most comments become concrete limitation signals. If a curated review exists, its researched rationale, pricing, features, strengths, limitations, sources, and other overrides replace the generated equivalents.

# module-relationships

The parent home route calls the list server function during loading. `HomeView` presents provisional list rows, calls the detail server function on selection, and supplies the returned item to `ProductDetailPanel`. The detail item must therefore remain compatible with catalog item semantics even though its source is live.

The curated review file is source-owned by this module and guarded by tests that assert a specific repository snapshot, required detail fields, causal popularity explanations, and non-metric-shaped strengths. Changes to the snapshot or override shape require coordinated test updates based on real research.

GitHub is the sole external integration. `GITHUB_TOKEN` or `GH_TOKEN` is optional and remains server-side; without it, the module operates under unauthenticated rate limits. Official repository, README, Trending, and issue links become visible evidence in the detail panel.

# constraints

Never expose GitHub credentials to the browser. Client input must pass validation before it influences API paths.

Trending position and star velocity are momentum evidence, not hands-on quality proof. Generated detail confidence remains medium or low, and the provisional badge must be preserved unless actual testing justifies a stronger claim.

Curated popularity rationales must explain why the repository is adopted rather than merely restating stars or rank. Strengths must describe repository-specific user consequences; limitations should name actual issues or constraints.

Keep fetch failures non-fatal to the wider application. The category catalog is the durable product surface and must remain usable when GitHub is unavailable.

# known-limits

The parser depends on GitHub's current HTML classes and article shape. A markup change can produce an empty feed without a compile-time signal. Entity decoding is intentionally limited and regular-expression parsing is not a general HTML parser.

Caches are process-local, unbounded by repository count, and reset with each container instance. A twelve-hour detail cache can serve stale metadata, issues, or README-derived features. Multiple replicas do not share results.

Generated feature extraction is heuristic, category rules are first-match regular expressions, and issue popularity is not equivalent to severity. Curated overrides improve quality only for the explicitly researched snapshot and require manual maintenance.

# notes-for-ai

When changing list parsing, use realistic Trending markup and retain the empty-result failure check. When changing detail enrichment, test partial upstream failures, pending-request deduplication, license edge cases, issue filtering, feature-section parsing, and curated override precedence.

Do not broaden client-trusted fields or move API calls into client components. Preserve timeouts and graceful fallback behavior. Any claim upgrade beyond provisional requires evidence outside short-term Trending signals.
