# purpose

The catalog module is the current source of truth for public WhichToUse categories and authored rankings. It loads version-controlled JSON at build time, exposes synchronous projections for routes and search, defines the item/detail contracts shared by the interface, and derives presentation-only ranks and scores.

# structure

The category index defines each use-case slug, display name, affiliate-potential tier, and ordering. Authored category files contain an update date, separate app and skill tracks, and optional editorial notes. Skill-track entries distinguish packaged agent skills from ordinary repositories through `kind`.

All category files are eagerly imported into a slug-keyed map. A category's `ready` flag is derived from whether an authored content file exists. This allows navigation to list the full taxonomy while incomplete categories resolve to empty tracks rather than disappearing.

The item contract carries ranking position, official links, pricing summary, best-fit text, confidence, testing badge, and sources. Rich detail fields such as rank rationale, free and paid pricing, features, strengths, and limitations remain optional so the UI can render partially enriched content without inventing values.

# flows

At module initialization, the category index is sorted by its explicit `sort` value and every category content file is loaded. Route loaders call `getCategories` for navigation or `getCategoryView` for one slug. Unknown slugs return null; known but unfinished categories return an empty view.

Search projection flattens every category plus every authored product. Product identifiers use `<track>:<rank>`, the same identity scheme used by category rows and URL-hash selection.

`rankItems` can merge app entries before skill entries and assign an overall position. Its numerical score declines from a fixed starting value and is not a quality measurement; category rendering uses a related confidence-banded presentation rule.

# module-relationships

The parent web application treats this module as synchronous build-time data. Sidebar, search, category routes, ranking rows, and the detail panel all rely on its types and identifiers. Changing the JSON shape requires coordinated updates to those consumers.

The `enrichment-workflow` module writes the six rich detail fields into category files and validates structural completeness while preserving ranks and existing fields. The `ingest-pipeline` module represents an older PostgreSQL-based acquisition and ranking path; it does not currently populate the version-controlled catalog automatically.

# constraints

Catalog slugs must match between the category index and category content. Rank order is editorial input and enrichment must not reorder it. Product search identities depend on ranks being stable and unique within each track.

The catalog is intentionally honest about evidence depth. Confidence and badges must remain consistent with actual research or testing, and optional details must not be filled with unsupported claims.

`import.meta.glob` requires a literal relative pattern; the `~` alias cannot be used for that discovery expression.

# known-limits

All content is bundled at build time, so updates require a rebuild and deployment. There is no runtime persistence, editorial API, schema validator in the app build, or automatic reconciliation with the legacy PostgreSQL rankings.

Readiness only checks file presence, not semantic completeness. Optional rich fields allow incomplete cards to render, and the UI's display scores are placeholders rather than externally validated measurements.

# notes-for-ai

When changing a category or item contract, inspect category JSON, route loaders, ranking rows, search, and the detail panel together. Preserve existing rank order unless the task explicitly changes ranking.

Use the enrichment validator for detail-field edits and run the application build to catch malformed JSON and type incompatibilities. Treat numerical display scores as UI decoration; new ranking logic belongs in an explicitly authorized ranking workflow, not in these projections.
