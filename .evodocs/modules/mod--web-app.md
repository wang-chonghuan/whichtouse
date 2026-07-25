# purpose

The web application is the public WhichToUse experience: a TanStack Start server-rendered site that lets readers browse use-case categories, compare app/SaaS and skill/repository tracks, inspect evidence-rich product details, and view a live GitHub Trending feed. It owns routing, layout, responsive navigation, interaction state, metadata, presentation rules, and the production server package. Catalog semantics and GitHub Trending research are delegated to child modules.

# structure

The root document establishes the Astryx Butter theme, global StyleX output, default SEO tags, icons, and the scripts required by TanStack Start. It also mounts Cloudflare Web Analytics manually. This is an operational constraint rather than incidental markup: the apex domain remains DNS-only so Azure can renew its managed certificate, which prevents Cloudflare proxy-side automatic injection.

The application shell is a fixed-height column with a persistent navigation bar and a body split between sidebar and route content. Scroll ownership belongs to the active page area rather than the document. Desktop sidebar visibility and mobile drawer visibility are intentionally separate Zustand state. The server cannot know the viewport, so the mobile hook begins in desktop mode for hydration consistency and corrects from `matchMedia` after mount.

The home experience combines editorial positioning with a runtime Trending table. Selecting a repository opens the shared detail panel after a server-side research request. A request counter protects selection state from out-of-order responses. Category pages render two independent ranking columns and use the same panel contract for detailed rationale, pricing, features, strengths, limitations, sources, and alternatives.

The top navigation owns global catalog search. Its matcher layers exact, prefix, word-prefix, adjacent-transposition, compact-subsequence, substring, and bounded edit-distance matches. Category results are favored over product results when relevance is otherwise equal. The sidebar and search both navigate through typed TanStack routes.

Build and runtime packaging live with the app. Vite runs StyleX extraction before React, TanStack Start produces the route/server application, and Nitro emits `.output`. The root Dockerfile installs the app-local lockfile under Node 24, builds the app, and copies only the Nitro output into the runtime image.

# flows

On an application request, TanStack Start resolves the matching route loader. The shell loader obtains category and search data, then the leaf loader obtains either the home Trending result or a category view. Unknown category slugs produce the router's not-found response instead of an empty ranking.

On the home page, Trending rows are initially rendered from the list response. Selecting a row sends the validated repository summary to a server function. The UI displays loading state, ignores stale responses, and opens the detail panel only for the newest successful request. Failure leaves the page usable and reports a local detail error.

On a category page, static item data is converted into display rows. Scores are derived within confidence bands and decline by position; they are explicitly placeholders rather than independent measurements. A URL hash can select an item on entry. Clicking an item updates local selection and supplies same-track alternatives to the shared panel.

Search opens from the navigation trigger or a window event, scores the build-time catalog entries, and routes to the selected category. Product results carry an item identifier so the destination can select the appropriate detail row.

# module-relationships

`web-app/catalog` is the source of category metadata, authored rankings, search entries, and the shared item types consumed by routes and components. Because its JSON is eagerly bundled, catalog edits become visible only after a new application build.

`web-app/github-trending` supplies the server functions used by the home route and translates live repositories into the same detail-panel shape used by catalog products. Trending availability is isolated: a fetch or GitHub API failure should degrade the home feed without blocking category navigation.

The root deployment contract is the Nitro `.output` directory produced from `app/` and copied by the repository-level Dockerfile. Azure Container Apps supplies runtime environment variables. The retained PostgreSQL client is server-only and uses the project schema, but current catalog rendering does not call it.

# constraints

Preserve SSR/client first-render agreement. Do not derive initial layout from `window`, and keep desktop and mobile sidebar state independent unless the server gains an authoritative viewport signal.

Keep secrets out of browser bundles. Public identifiers such as the Cloudflare site token may appear in markup, but database and GitHub credentials must remain in server-only code and environment variables.

Do not present derived scores as tested quality. Confidence badges, provisional wording, and source-backed detail fields are part of the product's honesty contract.

StyleX is the styling authority and must run before the React plugin. The application has no repository-root package manifest; build and test commands operate in `app/`.

# known-limits

The category experience is build-time static and cannot reflect content edits until redeployment. The database client and schema remain in the repository even though the current site no longer reads catalog rankings from PostgreSQL, creating a legacy boundary that can confuse future work.

The detail dialog does not implement a full focus trap, and ordinary category row selection is primarily local state. Mobile detection corrects only after hydration, so responsive behavior depends on CSS being sufficient during the first frame.

Display scores are deterministic presentation placeholders. They do not incorporate hands-on test results and must not be reused as a durable ranking signal.

# notes-for-ai

When changing navigation or layout, test at both sides of the 900px breakpoint and confirm the top bar, sidebar/drawer, content scroll area, and detail panel do not compete for viewport height. When changing route data contracts, inspect both child modules and `ProductDetailPanel`.

Run the app tests and production build after shared type or server-function changes. For interaction changes, verify keyboard search, route transitions, stale Trending requests, panel close behavior, and direct category URLs. Preserve page-specific canonical metadata and the manual analytics-beacon constraint.
