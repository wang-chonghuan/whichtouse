# purpose

The ingest pipeline is a repository-local agent skill and deterministic script suite for discovering agent products, collecting native popularity signals, writing provisional candidates to PostgreSQL, recomputing category rankings, and exporting machine-readable static files. It represents the original Phase 1 three-track data path and remains operationally significant even though the current web interface reads a separate version-controlled catalog.

# structure

The skill contract defines the boundary between semantic agent judgment and scripts. Scripts own API calls, signal math, deduplication, database writes, ranking SQL, and file generation. The host agent owns ambiguous category/form-factor decisions and adjustments to category keywords or seed sources when a track is thin.

The ingest orchestrator loads category configuration, limits each track to a small candidate set, and processes categories sequentially. GitHub discovery has a general repository search and a dedicated skill/MCP search. App discovery uses the public aiagentsdirectory API as a seed source rather than a database mirror.

The database adapter owns lazy PostgreSQL access to `whichtouse-schema`, category lookup, conflict-aware item upsert, and connection shutdown. The ranking script performs full replacement inside one transaction. The static exporter reads categories and rankings and writes `llms.txt`, a category index, and one JSON document per category under the app's public assets.

# flows

For each configured category, the orchestrator first confirms that the category exists in PostgreSQL. It searches GitHub using bounded keyword sets, separates a precision-oriented MCP/skill candidate set from general repositories, and excludes skill URLs from the repository track. GitHub stars become the overall signal; stars divided by repository age in months become the current growth proxy.

App candidates are fetched once from aiagentsdirectory, matched against terms derived from category keywords and names, filtered to remove clearly open-source entries, ordered by upvotes, and limited. Upvotes become the overall signal and age-normalized upvotes become growth.

Every item is written with a provisional badge. Repository URLs are deduplication keys for code tracks; app records use the homepage domain where possible. A conflict on category and deduplication key updates the existing record, including its form factor and signals.

Ranking deletes the current ranking set and rebuilds it atomically. Each category/form-factor partition receives up to ten overall entries and five growth entries. Best 3 selects the top item from each form factor, normalizes its signal against the maximum in that track, and orders the winners within the category.

Static export reconstructs overall, growth, and Best 3 collections and writes public JSON plus an `llms.txt` index. These files are snapshots and change only when the exporter runs.

# module-relationships

The pipeline depends on `resources/content/wt-sources.json`, the PostgreSQL schema under `ssot-schemas`, GitHub search/API behavior, the local `gh auth token`, and aiagentsdirectory's public response shape. It writes production-like project data and therefore must follow credential and redline discipline.

Its generated public files are served by the web container, but the current catalog UI does not query the rankings tables or these three-track JSON files. `web-app/catalog` instead bundles authored two-track JSON. Treat synchronization between these models as absent unless a ticket explicitly introduces a bridge.

The enrichment workflow targets authored category JSON and does not enrich PostgreSQL items. Both skills influence ranking content, but they operate on different stores and contracts.

# constraints

Discovery must aggregate small top-N slices and may not mirror a competitor's full database. Product Hunt commercial use and blocked scraping sources remain outside the automated path.

Credentials must come from environment variables or the local GitHub CLI and must never be embedded in code or command output. Database connections must keep the project schema search path.

All acquired records remain provisional. Growth is an age-normalized proxy, not a measured thirty-day delta, despite older comments and configuration labels that mention last-30-day growth.

Ranking replacement must remain transactional so readers never observe a partially rebuilt set. Deduplication must preserve one category/form-factor identity per canonical product key.

# known-limits

The skill is manual and has no scheduler. Per-category failures are logged and skipped, which allows partial ingestion to finish without a failing process status. Dedicated skill discovery requires `mcp` in the repository name, so it excludes many genuine agent skills and can include MCP servers despite the current catalog's preference for packaged skills.

The aiagentsdirectory adapter assumes a flexible but undocumented response shape and performs broad text matching. GitHub search and unaudited age-normalized velocity can favor old or ambiguously categorized repositories.

The PostgreSQL model has three tracks and signal rankings, while the current site uses two authored tracks with rich evidence fields. Running ingest and rank alone does not update the visible catalog.

# notes-for-ai

Before running the pipeline, confirm database credentials, schema state, source configuration, and whether production writes are authorized. Test a single category before a full run and inspect track overlap and category fit rather than trusting keyword matches.

When changing ranking SQL, verify partition sizes, deterministic tie-breaking, Best 3 coverage, and transaction rollback. When changing discovery, preserve top-N compliance and explicit provisional labeling. Do not assume generated static files or database rows feed the current UI without tracing the catalog path.
