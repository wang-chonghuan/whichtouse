import type { Confidence, Source } from '~/lib/catalog'

export type CuratedTrendingReview = {
  homepage: string
  bestFor: string
  confidence: Confidence
  rankBasis: string
  pricing: string
  pricingFree: string | null
  pricingPaid: string | null
  features: string[]
  pros: string[]
  cons: string[]
  sources: Source[]
}

export const CURATED_TRENDING_REVIEWS: Record<string, CuratedTrendingReview> = {
  'block/buzz': {
    homepage: 'https://github.com/block/buzz',
    bestFor:
      'Engineering teams that want humans, coding agents, chat, repository events, and approval workflows to share one self-hosted project record.',
    confidence: 'high',
    rankBasis:
      'Buzz is attracting attention because it replaces the usual chat-plus-bots-plus-CI glue with one workspace where humans and agents have the same rooms, identities, tools, and searchable history. Its Nostr-based relay stores messages, patches, workflow steps, approvals, and git events as signed events in one log, making the “agent as teammate” promise auditable rather than a chat-only demo; roughly 9k stars in its first five months confirm that this integrated collaboration model has landed with developers.',
    pricing: 'Free and open source',
    pricingFree:
      'Free & open-source (Apache-2.0; self-hosted relay plus desktop, CLI, and agent adapters)',
    pricingPaid: null,
    features: [
      'Shared channels, threads, canvases, media, search, and audit history for people and agents',
      'Agent-first JSON CLI plus ACP adapters for Goose, Codex, and Claude Code',
      'YAML workflows triggered by messages, reactions, schedules, and webhooks',
      'Nostr-signed chat, git, workflow, and approval events on a self-hosted relay',
    ],
    pros: [
      'A single signed event model lets chat, patches, workflow runs, and approvals remain searchable in the same project history instead of being split across disconnected tools',
      'Agents receive their own keys, channel memberships, CLI, and ACP bridge, so teams can scope and audit agent actions like a teammate rather than share an all-powerful bot token',
      'The relay isolates storage, authentication, pub/sub, search, audit, and workflow crates behind one orchestration point, giving self-hosters a coherent system instead of a collection of loosely coupled integrations',
    ],
    cons: [
      'The product is still incomplete: its own workflow engine marks approval gates as failed because the approval-resume path is not implemented yet',
      'Windows agent sessions can stop responding after only a few messages and remain silent for 10+ minutes (issue #2450)',
      'Several self-host and CLI paths are still brittle: issue #2308 documents a TLS CryptoProvider panic, while issue #2373 shows working workflows disappearing from the desktop management list',
    ],
    sources: [
      { name: 'Repository README', url: 'https://github.com/block/buzz' },
      {
        name: 'Architecture and event pipeline',
        url: 'https://github.com/block/buzz/blob/main/ARCHITECTURE.md',
      },
      {
        name: 'Workflow engine',
        url: 'https://github.com/block/buzz/blob/main/crates/buzz-workflow/src/lib.rs',
      },
      {
        name: 'Windows agent reliability issue',
        url: 'https://github.com/block/buzz/issues/2450',
      },
      {
        name: 'CLI TLS panic issue',
        url: 'https://github.com/block/buzz/issues/2308',
      },
      {
        name: 'Workflow visibility issue',
        url: 'https://github.com/block/buzz/issues/2373',
      },
    ],
  },
  'koala73/worldmonitor': {
    homepage: 'https://www.worldmonitor.app',
    bestFor:
      'A browser-first global intelligence workspace that connects geopolitical news with military, maritime, infrastructure, market, cyber, and natural-hazard signals on one live map.',
    confidence: 'high',
    rankBasis:
      'World Monitor ranks near the top because it compresses a fragmented, institution-grade OSINT workflow into a no-signup browser product: 500+ feeds and 56 map layers converge on one operational view, while cross-source correlation helps users see when physical, market, and editorial signals reinforce each other. Its rise from a January 2026 weekend project to 2M+ users and roughly 73k GitHub stars confirms that the accessible “global control room” framing solved a real information-overload problem; those adoption numbers validate the product thesis rather than constitute the thesis.',
    pricing: 'Free dashboard; Pro and API tiers available',
    pricingFree:
      'Free public dashboard with no signup — 56 map layers, 500+ feeds, country briefs, instability scores, chokepoints, alerts, and watchlists; AGPL-3.0 source is available for self-hosting',
    pricingPaid:
      'Pro $39.99/month or $399.99/year — WM Analyst chat, Scenario Engine, AI digests, custom widgets, and MCP access',
    features: [
      '500+ feeds and 56 live layers across dual 3D/WebGL maps',
      'Cross-source correlation, corroborated alerts, and Country Instability Index',
      'AI briefs, scenario analysis, custom monitors, and 40-tool MCP access',
      'Browser, Tauri desktop, Docker/self-host, API, CLI, and SDK access',
    ],
    pros: [
      'Connects physical signals, reporting, infrastructure, and markets in one workspace, so analysts can investigate convergence without assembling separate tracking tools',
      'Runs immediately in the browser with no signup, while desktop and self-hosted deployments provide a path for local or controlled environments',
      'Keeps conclusions inspectable through source links, freshness metadata, documented scoring algorithms, and an open processing pipeline rather than presenting an unexplained AI verdict',
    ],
    cons: [
      'The breadth produces a heavy mobile runtime: issue #5165 records 20 post-hydration long tasks, 9.5s total blocking time, and 35.3s time-to-interactive in a throttled mobile trace',
      'Anonymous-session failures can blank many widgets at once: issue #5251 measured recurring fresh-session 401 failures followed by a 15-minute client cooldown',
      'Forecasting is not yet a proven intelligence edge: issue #5233 reports a narrow, 37%-synthetic input funnel and says the current Brier score cannot validate real forecasting skill',
    ],
    sources: [
      {
        name: 'Official overview',
        url: 'https://www.worldmonitor.app/docs/about',
      },
      {
        name: 'Repository README',
        url: 'https://github.com/koala73/worldmonitor',
      },
      {
        name: 'Architecture & entry flow',
        url: 'https://github.com/koala73/worldmonitor/blob/main/ARCHITECTURE.md',
      },
      {
        name: 'Independent OSINT analysis',
        url: 'https://projectosint.com/world-monitor-osint-real-time-conflict-tracking/',
      },
      {
        name: 'Mobile performance issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5165',
      },
      {
        name: 'Session reliability issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5251',
      },
      {
        name: 'Forecast validation issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5233',
      },
    ],
  },
  'ComposioHQ/awesome-claude-skills': {
    homepage: 'https://github.com/ComposioHQ/awesome-claude-skills',
    bestFor:
      'Agent users who want a broad, browsable starting library of task instructions and app-automation recipes that can be adapted across Claude Code, Codex, Cursor, and other coding agents.',
    confidence: 'high',
    rankBasis:
      'Awesome Claude Skills became a discovery hub by collecting 1,000+ practical skill packages in one task-oriented index just as the SKILL.md format spread beyond Claude into Codex, Cursor, Gemini CLI, and other agents. It reduces the work of finding examples, learning the package structure, and encoding common SaaS workflows from scratch; nearly 70k stars and thousands of forks confirm that portability plus breadth made it a default entry point for the new skills ecosystem.',
    pricing: 'Free repository',
    pricingFree:
      'Free repository; the collection is published under Apache-2.0, while individual linked skills may use different licenses or paid external services',
    pricingPaid: null,
    features: [
      'Task-indexed directory of 1,000+ agent skills and plugins',
      'Reusable SKILL.md packages with optional scripts, references, and assets',
      'App-automation recipes covering CRM, support, analytics, communication, and developer tools',
      'Connect-apps plugin for authenticated actions across external services',
    ],
    pros: [
      'The category index turns a fragmented skill ecosystem into a browsable catalog, so users can start from a relevant workflow instead of inventing package structure and prompts from zero',
      'Progressive-disclosure packages keep the activation metadata small while allowing scripts and references to load only when needed, making large skill libraries practical inside agent context limits',
      'The app-automation entries document tool sequences, parameters, and known pitfalls for recurring SaaS jobs, giving agents procedural guidance beyond a bare MCP tool list',
    ],
    cons: [
      'This is a mixed-source directory rather than one tested runtime: the README explicitly warns that individual skills can have different licenses, and quality or maintenance varies by contributor',
      'Some automation recipes depend on external infrastructure that can change underneath them; issue #834 reports Rube-based skills losing their service dependency when Rube was discontinued',
      'Bundled helper scripts are not uniformly hardened: issue #713 identifies a web-testing server helper that can deadlock when verbose child-process pipes fill',
    ],
    sources: [
      {
        name: 'Repository and catalog',
        url: 'https://github.com/ComposioHQ/awesome-claude-skills',
      },
      {
        name: 'Skill creator reference',
        url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/skill-creator',
      },
      {
        name: 'Connect-apps plugin',
        url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/connect-apps-plugin',
      },
      {
        name: 'Rube dependency issue',
        url: 'https://github.com/ComposioHQ/awesome-claude-skills/issues/834',
      },
      {
        name: 'Server helper deadlock issue',
        url: 'https://github.com/ComposioHQ/awesome-claude-skills/issues/713',
      },
    ],
  },
  'Pumpkin-MC/Pumpkin': {
    homepage: 'https://pumpkinmc.org/',
    bestFor:
      'Experienced Minecraft server operators and plugin developers who want to test a memory-safe, Rust-native alternative to the established Java server stack.',
    confidence: 'high',
    rankBasis:
      'Pumpkin is popular because it attacks a familiar Minecraft hosting bottleneck at the runtime level: the server, protocol codecs, world engine, inventory system, and plugin host are implemented as a Rust workspace rather than layered onto the Java server ecosystem. Multi-threaded Tokio/Rayon execution, Java and in-progress Bedrock protocol support, and a permissioned WebAssembly component model make the performance-and-safety thesis tangible; more than 9k stars show strong demand for that alternative even before a stable 1.0 release.',
    pricing: 'Free and open source',
    pricingFree: 'Free & open-source (GPL-3.0; self-host)',
    pricingPaid: null,
    features: [
      'Rust-native Java and in-progress Bedrock Minecraft server',
      'Parallel world, chunk, entity, inventory, and protocol subsystems',
      'Configurable world formats, proxies, RCON, permissions, and translations',
      'Permission-declared WebAssembly component plugin API',
    ],
    pros: [
      'Separating protocol, codecs, world, inventory, and server crates lets performance-sensitive paths use Rust concurrency without carrying a JVM-based server core',
      'Java and Bedrock listeners can run from the same server configuration, reducing the need to operate separate edition-specific stacks as Bedrock support matures',
      'Plugins declare host permissions through a WIT component boundary, giving operators a more explicit sandbox contract than loading unrestricted native extensions',
    ],
    cons: [
      'It is explicitly pre-1.0: issue #449 still lists a stable plugin ABI, 1,000-player stress test, memory-leak audit, 20-TPS validation, and cross-platform verification as release blockers',
      'The plugin direction is unsettled; issue #2299 argues that non-Rust languages bundle heavy runtimes inside WebAssembly and proposes replacing the current API with Luau',
      'Deployment is not yet routine across supported paths: issue #2057 reports the official container immediately panicking under a basic Ubuntu Docker Compose setup',
    ],
    sources: [
      { name: 'Official overview', url: 'https://github.com/Pumpkin-MC/Pumpkin' },
      {
        name: 'Server entry point',
        url: 'https://github.com/Pumpkin-MC/Pumpkin/blob/master/pumpkin/src/main.rs',
      },
      {
        name: 'Plugin API entry',
        url: 'https://github.com/Pumpkin-MC/Pumpkin/blob/master/pumpkin-plugin-api/src/lib.rs',
      },
      {
        name: '1.0 release blockers',
        url: 'https://github.com/Pumpkin-MC/Pumpkin/issues/449',
      },
      {
        name: 'Plugin architecture debate',
        url: 'https://github.com/Pumpkin-MC/Pumpkin/issues/2299',
      },
      {
        name: 'Docker startup issue',
        url: 'https://github.com/Pumpkin-MC/Pumpkin/issues/2057',
      },
    ],
  },
  'shiyu-coder/Kronos': {
    homepage: 'https://github.com/shiyu-coder/Kronos',
    bestFor:
      'Quantitative researchers who want an open pretrained model for experimenting with multi-asset OHLCV forecasting and fine-tuning on their own market data.',
    confidence: 'high',
    rankBasis:
      'Kronos drew attention by treating candlesticks as a domain language instead of forcing financial series through a generic forecasting model: a specialized tokenizer converts continuous OHLCV bars into hierarchical discrete tokens, then an autoregressive Transformer models those sequences across data from 45+ exchanges. Downloadable checkpoints, a small predictor API, and a Qlib fine-tuning/backtest path make the research immediately testable; its AAAI 2026 acceptance and roughly 33k stars confirm that the finance-specific foundation-model framing resonated.',
    pricing: 'Free and open source',
    pricingFree: 'Free & open-source (MIT; self-hosted models and code)',
    pricingPaid: null,
    features: [
      'Hierarchical tokenizer for OHLCV candlestick sequences',
      'Autoregressive mini, small, and base forecasting checkpoints',
      'Probabilistic single-series and GPU batch prediction',
      'Qlib fine-tuning and example backtesting pipeline',
    ],
    pros: [
      'The two-stage tokenizer preserves relationships among open, high, low, close, volume, and time before sequence modeling, giving market data a purpose-built representation rather than a generic text or scalar encoding',
      'KronosPredictor handles normalization, sampling, inverse transformation, and DataFrame output, so researchers can test a pretrained model without rebuilding the inference plumbing',
      'The released Qlib path connects fine-tuning, signal generation, transaction-cost-aware backtesting, and risk analysis in one reproducible research scaffold',
    ],
    cons: [
      'The repository warns that its top-K backtest is only a demonstration, not a production trading system; portfolio constraints, factor neutralization, slippage, and market impact remain outside the model',
      'Small and base checkpoints accept only 512 context steps and truncate longer histories; batch prediction also requires every series to have identical lookback and forecast lengths',
      'Real-world predictive value is disputed by users: issue #299 reports month-long experiments performing no better than a coin flip, while issue #92 reports short forecasts disconnecting from the input series',
    ],
    sources: [
      { name: 'Repository README', url: 'https://github.com/shiyu-coder/Kronos' },
      {
        name: 'Tokenizer and predictor implementation',
        url: 'https://github.com/shiyu-coder/Kronos/blob/master/model/kronos.py',
      },
      {
        name: 'Qlib evaluation path',
        url: 'https://github.com/shiyu-coder/Kronos/blob/master/finetune/qlib_test.py',
      },
      {
        name: 'Prediction efficacy issue',
        url: 'https://github.com/shiyu-coder/Kronos/issues/299',
      },
      {
        name: 'Forecast continuity issue',
        url: 'https://github.com/shiyu-coder/Kronos/issues/92',
      },
    ],
  },
  'Automattic/harper': {
    homepage: 'https://writewithharper.com',
    bestFor:
      'English-language writers and developers who want fast grammar and style feedback inside editors, browsers, or local applications without sending drafts to a cloud service.',
    confidence: 'high',
    rankBasis:
      'Harper is winning users by delivering the part of Grammarly and LanguageTool they want without their main tradeoffs: its Rust rule engine lints locally in milliseconds, uses a compact curated dictionary, and ships through WebAssembly, a language server, editor plugins, and native apps. That privacy-plus-latency advantage is immediately visible during writing rather than being an abstract infrastructure claim, and roughly 13k stars plus broad editor integrations confirm the appeal of an offline grammar checker that stays out of the way.',
    pricing: 'Free and open source',
    pricingFree:
      'Free & open-source (Apache-2.0; local web, language-server, editor-plugin, CLI, and desktop integrations)',
    pricingPaid: null,
    features: [
      'Offline English grammar, spelling, punctuation, and style checks',
      'Rust core distributed through WebAssembly and language-server interfaces',
      'Editor integrations for VS Code, Neovim, Helix, Emacs, Zed, and Obsidian',
      'Configurable dialects, rules, ignored lints, and user dictionaries',
    ],
    pros: [
      'All linting runs on-device through the Rust core, so drafts never need a network round trip and sensitive text is not uploaded for analysis',
      'The same parser, dictionary, and lint groups are exposed through WebAssembly and LSP boundaries, giving browser and editor integrations consistent results without separate engines',
      'Priority-aware overlap removal and configurable rule groups suppress competing suggestions, producing a less intrusive editing loop than emitting every matching rule',
    ],
    cons: [
      'Harper currently supports English only, and issue #2654 notes there is still no clear centralized roadmap for French, Spanish, Italian, German, or other languages',
      'Coverage depends on host integration and file type: issue #149 reports the language server working for Markdown but not plain-text or other configured files',
      'The native macOS integration is not yet reliable for every user; issue #3565 reports the app producing no suggestions in Safari or other enabled applications',
    ],
    sources: [
      { name: 'Official overview', url: 'https://github.com/Automattic/harper' },
      {
        name: 'Core lint engine',
        url: 'https://github.com/Automattic/harper/blob/master/harper-core/src/lib.rs',
      },
      {
        name: 'WebAssembly interface',
        url: 'https://github.com/Automattic/harper/blob/master/harper-wasm/src/lib.rs',
      },
      {
        name: 'Language support issue',
        url: 'https://github.com/Automattic/harper/issues/2654',
      },
      {
        name: 'Plain-text LSP issue',
        url: 'https://github.com/Automattic/harper/issues/149',
      },
      {
        name: 'macOS integration issue',
        url: 'https://github.com/Automattic/harper/issues/3565',
      },
    ],
  },
  'likec4/likec4': {
    homepage: 'https://likec4.dev',
    bestFor:
      'Software teams that want architecture diagrams versioned with the system model, rendered automatically, and reused in docs, reviews, IDEs, or generated sites.',
    confidence: 'high',
    rankBasis:
      'LikeC4 is popular because it turns architecture diagrams from manually maintained pictures into projections of a text model: teams define systems, nested elements, relationships, notation, and views once, then the CLI, language server, Graphviz layouts, React components, and static-site generator reuse the same source. This keeps diagrams reviewable beside code while still producing an interactive visual artifact; about 5k stars and established CLI/VS Code usage confirm demand for a more flexible C4-style architecture-as-code workflow.',
    pricing: 'Free and open source',
    pricingFree: 'Free & open-source (MIT; CLI, language server, viewer, and generators)',
    pricingPaid: null,
    features: [
      'Customizable C4-inspired architecture modeling language',
      'Automatic and manual Graphviz-backed diagram layouts',
      'Live preview, validation, export, static-site, and React code generation',
      'VS Code language server plus CLI and MCP interfaces',
    ],
    pros: [
      'A single typed model can generate multiple scoped views, so architecture changes and diagrams can be reviewed together instead of synchronizing separate drawing files',
      'The language server combines parsing, file watching, Graphviz layout, and manual-layout snapshots, giving authors immediate feedback while preserving hand-tuned views when needed',
      'CLI exports, generated React components, and a deployable viewer reuse the computed model, allowing the same architecture source to serve documentation, portals, and application UIs',
    ],
    cons: [
      'Automatic layout degrades on dense systems: issue #751 shows large container views becoming excessively wide, and issue #1224 reports relationship labels overlapping between paired arrows',
      'Manual-layout behavior is not consistent across every output path; issue #2553 shows React code generation discarding snapshots that the static-site renderer respects',
      'Some modeling queries remain less expressive than the stored model: the current metadata-filter request explains that view predicates cannot filter on metadata values without encoding them as tags',
    ],
    sources: [
      { name: 'Repository README', url: 'https://github.com/likec4/likec4' },
      {
        name: 'CLI entry and commands',
        url: 'https://github.com/likec4/likec4/blob/main/packages/likec4/src/cli/index.ts',
      },
      {
        name: 'Language server and layout wiring',
        url: 'https://github.com/likec4/likec4/blob/main/packages/language-server/src/index.ts',
      },
      {
        name: 'Large-system layout issue',
        url: 'https://github.com/likec4/likec4/issues/751',
      },
      {
        name: 'Manual-layout codegen issue',
        url: 'https://github.com/likec4/likec4/issues/2553',
      },
      {
        name: 'Metadata filtering limitation',
        url: 'https://github.com/likec4/likec4/issues/2754',
      },
    ],
  },
  'citrolabs/ego-lite': {
    homepage: 'https://lite.ego.app',
    bestFor:
      'macOS users who want Codex, Claude Code, Cursor, or another external agent to automate authenticated websites in parallel without taking over their active browser tabs.',
    confidence: 'high',
    rankBasis:
      'ego lite is spreading because it removes the two most frustrating parts of agent browser automation: rebuilding authenticated sessions in a separate browser and losing control of the tabs an agent is driving. It migrates local Chrome state into a Chromium browser, gives each task an isolated Space, and exposes Playwright-style JavaScript facades so an agent can compose a full workflow in one execution; more than 2k stars within months confirm that “shared login state without shared tab control” is a compelling hook.',
    pricing: 'Free macOS app and open-source agent bridge',
    pricingFree:
      'Free macOS browser download; the ego-browser skill and TypeScript helper runtime are MIT-licensed',
    pricingPaid: null,
    features: [
      'Isolated parallel task Spaces that inherit local browser login state',
      'Playwright-style page, locator, browser, fetch, CDP, and task-space facades',
      'Semantic snapshots for nested frames and agent-friendly page inspection',
      'Reusable skills and site-specific learnings for browser workflows',
    ],
    pros: [
      'Migrating existing cookies, extensions, bookmarks, and logins removes repeated authentication setup while keeping browser data on the user device',
      'Task Spaces isolate each agent workflow from the user and from other agents, allowing parallel automation without tab stealing or cursor contention',
      'The JavaScript helper runtime lets an agent combine observation, actions, waits, extraction, and verification in one script, reducing the command-by-command token overhead of conventional browser CLIs',
    ],
    cons: [
      'The browser app is macOS-only today; the official install reference and open Linux request #140 confirm there is no supported Windows or Linux download',
      'Task-space cleanup can leak invisible renderer processes: issue #88 measured zero listed spaces but 11 live processes using about 564 MB after several days',
      'Baseline resource use can be high even before automation scales up; issue #69 reports GPU utilization rising from roughly 10% idle to more than 30% whenever ego lite is open',
    ],
    sources: [
      { name: 'Official overview', url: 'https://github.com/citrolabs/ego-lite' },
      {
        name: 'Agent skill contract',
        url: 'https://github.com/citrolabs/ego-lite/blob/main/skills/ego-browser/SKILL.md',
      },
      {
        name: 'Helper runtime entry',
        url: 'https://github.com/citrolabs/ego-lite/blob/main/package/ego-browser/src/index.ts',
      },
      {
        name: 'Task-space process leak',
        url: 'https://github.com/citrolabs/ego-lite/issues/88',
      },
      {
        name: 'GPU utilization issue',
        url: 'https://github.com/citrolabs/ego-lite/issues/69',
      },
      {
        name: 'Linux availability request',
        url: 'https://github.com/citrolabs/ego-lite/issues/140',
      },
    ],
  },
  'yorukot/superfile': {
    homepage: 'https://superfile.dev',
    bestFor:
      'Terminal-heavy users who want a visual multi-panel file manager with previews, metadata, configurable keys, and common filesystem operations without leaving the shell.',
    confidence: 'high',
    rankBasis:
      'superfile is popular because it brings the spatial awareness of a desktop file manager into a keyboard-driven terminal workflow: Bubble Tea maintains panels, sidebar, search, preview, metadata, clipboard, and progress state while native Go operations handle copy, move, compression, extraction, and trash. A polished theme and plugin surface make it approachable beyond TUI enthusiasts, and roughly 19k stars plus package-manager distribution confirm that the “modern file manager without leaving the terminal” proposition has broad appeal.',
    pricing: 'Free and open source',
    pricingFree: 'Free & open-source (MIT; local terminal application)',
    pricingPaid: null,
    features: [
      'Multi-panel terminal file browsing with sidebar and search',
      'File previews, metadata, clipboard, and operation progress',
      'Copy, move, rename, trash, compress, extract, and chooser workflows',
      'Custom themes, hotkeys, plugins, and zoxide integration',
    ],
    pros: [
      'The Bubble Tea model coordinates navigation, previews, metadata, prompts, clipboard, and progress in one event loop, so common file work remains visible and keyboard-driven inside the terminal',
      'Move operations use a fast filesystem rename when possible and fall back to copy-and-delete across devices, preserving a simple user action across different storage layouts',
      'Configurable panels, themes, hotkeys, previewers, and chooser/last-directory outputs let the TUI fit existing shell and editor workflows instead of replacing them',
    ],
    cons: [
      'Windows remains explicitly not fully supported, and issue #688 reports Windows Defender blocking the packaged executable as potentially unwanted software',
      'External preview tools can conflict with user configuration: issue #1193 shows hard-coded bat flags causing the preview panel to fail on Arch Linux',
      'Cross-platform confidence is still uneven; issue #938 documents flaky Windows CI tests, making regressions on that platform harder to distinguish from test instability',
    ],
    sources: [
      { name: 'Repository README', url: 'https://github.com/yorukot/superfile' },
      {
        name: 'CLI and Bubble Tea entry',
        url: 'https://github.com/yorukot/superfile/blob/main/src/cmd/main.go',
      },
      {
        name: 'Application model',
        url: 'https://github.com/yorukot/superfile/blob/main/src/internal/model.go',
      },
      {
        name: 'Filesystem operations',
        url: 'https://github.com/yorukot/superfile/blob/main/src/internal/file_operations.go',
      },
      {
        name: 'Windows package issue',
        url: 'https://github.com/yorukot/superfile/issues/688',
      },
      {
        name: 'Preview integration issue',
        url: 'https://github.com/yorukot/superfile/issues/1193',
      },
    ],
  },
  'ruvnet/RuView': {
    homepage: 'https://cognitum.one/RuView',
    bestFor:
      'RF-sensing researchers and advanced smart-home builders who want to experiment with camera-free presence, motion, and vital-sign inference from ESP32 Channel State Information.',
    confidence: 'high',
    rankBasis:
      'RuView went viral because it turns an invisible resource already present in most rooms, WiFi reflections, into a camera-free sensing platform using inexpensive ESP32 nodes. Its Rust sensing server joins CSI ingestion, signal processing, vital extraction, model inference, WebSocket streaming, and Home Assistant/Matter output, while a public proof harness separates measured results from hardware- or data-gated claims; roughly 86k stars show how strongly the through-wall, privacy-preserving sensing idea resonates even though several headline capabilities remain research-grade.',
    pricing: 'Free software; sensing hardware required',
    pricingFree:
      'Free & open-source software (MIT); simulated Docker evaluation is free, while live CSI sensing requires compatible ESP32 or research-NIC hardware',
    pricingPaid: null,
    features: [
      'ESP32 CSI ingestion for presence, motion, breathing, and heart-rate signals',
      'Local Rust signal-processing, inference, calibration, and WebSocket pipeline',
      'Home Assistant, MQTT, Matter, Apple Home, Google Home, and Alexa integrations',
      'Reproducibility harness that grades claims as measured, claimed, data-gated, or hardware-gated',
    ],
    pros: [
      'CSI-based sensing can observe occupancy and periodic body motion without cameras, wearables, or cloud video, preserving visibility in darkness and privacy-sensitive rooms',
      'The sensing server combines UDP hardware frames, signal features, vital extraction, model loading, calibration, REST, and live WebSocket output, so researchers can inspect one end-to-end path rather than assemble separate prototypes',
      'The proof harness records commands, tests, retractions, and explicit non-claims, making it possible to distinguish reproduced signal-processing results from capabilities that still require unshipped data, weights, or hardware',
    ],
    cons: [
      'The repository labels itself beta and reports the current CSI-only on-device pose model at only about 3% PCK@20, far below its 35% target; many medical, identity, and edge-detection claims remain unvalidated or data-gated',
      'A real deployment is hardware- and calibration-heavy: full CSI needs compatible ESP32/NIC capture, while ordinary laptop WiFi is limited to coarse RSSI presence and motion',
      'Successful reproduction remains inconsistent for users: issue #1125 asks whether anyone has obtained real data, and issues #249/#237 report multi-node systems showing the same detection regardless of occupancy',
    ],
    sources: [
      { name: 'Repository overview', url: 'https://github.com/ruvnet/RuView' },
      {
        name: 'Measured versus claimed proof ledger',
        url: 'https://github.com/ruvnet/RuView/blob/main/PROOF.md',
      },
      {
        name: 'Rust sensing server entry',
        url: 'https://github.com/ruvnet/RuView/blob/main/v2/crates/wifi-densepose-sensing-server/src/main.rs',
      },
      {
        name: 'Real-data reproduction issue',
        url: 'https://github.com/ruvnet/RuView/issues/1125',
      },
      {
        name: 'Static detection output issue',
        url: 'https://github.com/ruvnet/RuView/issues/237',
      },
    ],
  },
  'CoreBunch/Instatic': {
    homepage: 'https://instatic.com',
    bestFor:
      'Designers and small teams who want a self-hosted visual CMS, structured content, forms, plugins, and static publishing in one deployable system.',
    confidence: 'high',
    rankBasis:
      'Instatic is attracting builders by collapsing the usual visual-editor, headless-CMS, form service, plugin host, database, and static-site pipeline into one self-hosted Bun process. The editor stores pages, components, and collections in one content model, while the publisher bakes semantic HTML and compact CSS to disk and only inserts tiny server-rendered holes for genuinely dynamic nodes; more than 4k stars shortly after launch confirm that “Webflow-like editing without platform lock-in or frontend runtime” is a strong proposition.',
    pricing: 'Free and open source',
    pricingFree:
      'Free & open-source (MIT; self-host with SQLite or Postgres; infrastructure and optional AI-provider usage are paid separately)',
    pricingPaid: null,
    features: [
      'Responsive visual canvas with design tokens, reusable components, templates, and loops',
      'Unified pages, posts, custom collections, forms, media, users, roles, and audit log',
      'Static HTML/CSS publisher with automatic dynamic server holes',
      'Permissioned plugin SDK with QuickJS-WASM server sandboxes',
    ],
    pros: [
      'The three-layer publisher serves fully static pages from disk, caches live fallbacks by publish version, and lazy-loads only detected dynamic nodes, keeping public pages independent of the React editor runtime',
      'Pages, posts, visual components, custom collections, and form submissions share one table-and-row model, allowing loops and templates to reuse structured content without separate CMS silos',
      'Plugin server code runs in per-plugin workers inside QuickJS-WASM with explicit network and host permissions, limiting the blast radius of backend extensions',
    ],
    cons: [
      'The project is intentionally pre-1.0 and warns that APIs and workflows can change; its package version remains 0.0.x despite the broad feature surface',
      'The visual editor still lacks common fine-grained styling workflows: issue #124 reports no mixed inline styling inside one text element, while issue #113 describes the missing middle ground between reusable classes and limited inline styles',
      'Not every plugin surface has the same isolation: editor extensions and app-style admin pages run unsandboxed in the admin window with the operator session and full DOM/API access',
    ],
    sources: [
      { name: 'Repository overview', url: 'https://github.com/CoreBunch/Instatic' },
      {
        name: 'System architecture',
        url: 'https://github.com/CoreBunch/Instatic/blob/main/docs/architecture.md',
      },
      {
        name: 'Plugin security model',
        url: 'https://github.com/CoreBunch/Instatic/blob/main/docs/features/plugin-system.md',
      },
      {
        name: 'Inline text styling gap',
        url: 'https://github.com/CoreBunch/Instatic/issues/124',
      },
      {
        name: 'Element styling gap',
        url: 'https://github.com/CoreBunch/Instatic/issues/113',
      },
    ],
  },
  'chrislgarry/Apollo-11': {
    homepage: 'https://github.com/chrislgarry/Apollo-11',
    bestFor:
      'Software historians, educators, and engineers who want to read, search, compare, or assemble the original Apollo 11 command- and lunar-module guidance programs.',
    confidence: 'high',
    rankBasis:
      'Apollo-11 remains popular because it turns a culturally important but physically inaccessible software artifact into something anyone can browse, search, annotate, diff, and study. The repository preserves the page order and monolithic include structure of the Comanche 055 and Luminary 099 assembly listings, links every transcription back to MIT Museum scans, and exposes real guidance, navigation, display, restart, and landing routines; more than 71k stars reflect enduring interest in seeing mission-critical 1969 software as source rather than mythology.',
    pricing: 'Public-domain source archive',
    pricingFree:
      'Free public-domain source transcription (Public Domain Mark 1.0)',
    pricingPaid: null,
    features: [
      'Command Module Comanche 055 AGC source transcription',
      'Lunar Module Luminary 099 AGC source transcription',
      'Page-indexed program sections linked to original scanned listings',
      'Community proofreading workflow and multilingual repository documentation',
    ],
    pros: [
      'Splitting the original monolithic listings into page-indexed include files makes thousands of lines of AGC assembly searchable and navigable while retaining their historical build order',
      'Contributions must be checked character-for-character against the original scans, preserving original comments and even historical typographical errors instead of silently modernizing the artifact',
      'Keeping both command- and lunar-module programs in one public archive lets readers compare real navigation, autopilot, restart, display, and landing implementations from the same mission',
    ],
    cons: [
      'This is a transcription archive, not a standalone simulator or build environment; compiling it requires the separate Virtual AGC project and its yaYUL replacement assembler',
      'The original YUL/GAP toolchain and generated tables are not fully reproduced, and yaYUL accepts a modified source format rather than the exact historical assembler input',
      'Proofreading is still incomplete: the repository milestones currently retain 17 open Comanche transcription issues and 93 open Luminary issues against the source scans',
    ],
    sources: [
      { name: 'Repository overview', url: 'https://github.com/chrislgarry/Apollo-11' },
      {
        name: 'Transcription rules',
        url: 'https://github.com/chrislgarry/Apollo-11/blob/master/CONTRIBUTING.md',
      },
      {
        name: 'Command Module source index',
        url: 'https://github.com/chrislgarry/Apollo-11/blob/master/Comanche055/MAIN.agc',
      },
      {
        name: 'Lunar Module source index',
        url: 'https://github.com/chrislgarry/Apollo-11/blob/master/Luminary099/README.md',
      },
      {
        name: 'Public Domain Mark',
        url: 'https://github.com/chrislgarry/Apollo-11/blob/master/LICENSE.md',
      },
    ],
  },
  'mattpocock/skills': {
    homepage: 'https://github.com/mattpocock/skills',
    bestFor:
      'Software engineers who want small, editable agent workflows for requirements discovery, domain modeling, TDD, debugging, implementation, review, and issue management.',
    confidence: 'high',
    rankBasis:
      'This collection became popular by packaging conventional engineering discipline into small agent skills instead of asking one framework to own the whole development process. Setup records the repository’s issue tracker and domain-document conventions, then focused skills compose grilling, specifications, tracer-bullet tickets, seam-based TDD, implementation, and review while remaining model-agnostic and editable; roughly 186k stars and 16k forks confirm unusually strong demand for agent workflows that preserve engineer control.',
    pricing: 'Free and open source',
    pricingFree:
      'Free & open-source (MIT; install editable copies with skills.sh or a managed Claude Code plugin bundle)',
    pricingPaid: null,
    features: [
      'Composable engineering skills for discovery, specs, tickets, TDD, debugging, and review',
      'Repository setup for issue trackers, triage vocabulary, CONTEXT.md, and ADR locations',
      'User-invoked orchestration separated from model-invoked engineering disciplines',
      'Editable cross-agent installation plus managed Claude Code plugin distribution',
    ],
    pros: [
      'Small skills isolate one engineering decision loop at a time, so teams can adopt or modify TDD, grilling, triage, or review without surrendering the entire workflow to one rigid process',
      'The setup skill writes issue-tracker and domain-document conventions into the repository, giving later agent sessions durable project context instead of relying only on conversation memory',
      'The TDD skill requires behavior tests at pre-agreed public seams and one red-green vertical slice at a time, directing agent speed toward observable feedback rather than bulk speculative code',
    ],
    cons: [
      'The workflows still depend on model compliance: issue #240 reports GPT 5.5 finishing a grilling session and starting implementation without permission',
      'Resolved requirements can be weakened as they move from grilling to PRD, issues, implementation, and verification; issue #341 documents the absence of a stable requirements ledger and coverage check',
      'Installing the bundle can collide with host-provided commands: issue #483 reports its /code-review skill overwriting Claude Code’s built-in command of the same name',
    ],
    sources: [
      { name: 'Repository and workflow map', url: 'https://github.com/mattpocock/skills' },
      {
        name: 'Repository setup skill',
        url: 'https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md',
      },
      {
        name: 'TDD skill',
        url: 'https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md',
      },
      {
        name: 'Grilling control issue',
        url: 'https://github.com/mattpocock/skills/issues/240',
      },
      {
        name: 'Requirements traceability issue',
        url: 'https://github.com/mattpocock/skills/issues/341',
      },
      {
        name: 'Command collision issue',
        url: 'https://github.com/mattpocock/skills/issues/483',
      },
    ],
  },
  'Lordog/dive-into-llms': {
    homepage: 'https://github.com/Lordog/dive-into-llms',
    bestFor:
      'Chinese-speaking students and researchers who want guided, notebook-based practice across LLM fine-tuning, prompting, reasoning, multimodal systems, agents, and model safety.',
    confidence: 'high',
    rankBasis:
      'Dive into LLMs is popular because it turns a broad graduate-level LLM syllabus into Chinese-language labs that learners can inspect and run instead of leaving the material at the paper-and-lecture level. Eleven chapters pair slides and explanations with notebooks or concrete external code paths for fine-tuning, prompting, knowledge editing, reasoning, watermarking, jailbreaks, multimodal models, GUI agents, agent security, and RLHF; roughly 45k stars confirm strong demand for this bridge from academic concepts to hands-on experiments.',
    pricing: 'Free educational repository',
    pricingFree:
      'Free educational materials on GitHub; no repository license is published, so the code and course assets should not be treated as open source',
    pricingPaid: null,
    features: [
      'Eleven Chinese-language LLM chapters with slides, walkthroughs, and notebooks',
      'Hands-on fine-tuning, deployment, prompting, knowledge-editing, and reasoning labs',
      'Model-safety exercises covering watermarking, jailbreaks, steganography, and RLHF',
      'Multimodal and GUI-agent labs built around external datasets, models, and training frameworks',
    ],
    pros: [
      'Each topic connects conceptual slides to a runnable notebook or explicit training path, helping learners move from reading an LLM technique to inspecting its data, model, and evaluation steps',
      'The curriculum joins capability and safety topics in one sequence, so students can study fine-tuning and agents alongside watermarking, jailbreaks, alignment, and agent-risk experiments',
      'Chapters reuse established models, datasets, and frameworks such as Qwen, DeepMath, NExT-GPT, OS-Kairos, and LLaMA-Factory, exposing learners to realistic research workflows rather than toy-only APIs',
    ],
    cons: [
      'The repository labels itself v0.1.0 and “Status-building,” disclaims complete correctness, and publishes no license, leaving both content stability and reuse rights uncertain',
      'Some labs are incomplete or need manual repair: issue #28 documents a data loader that cannot consume the Kaggle test set unchanged, while issue #26 reports missing multimodal code and data',
      'Hardware and platform requirements exclude many learners: the math lab requires at least 40 GB of GPU memory, the GUI-agent training path calls for at least three 80 GB A100 GPUs, and issue #13 reports incompatibility with macOS MPS',
    ],
    sources: [
      {
        name: 'Repository and curriculum',
        url: 'https://github.com/Lordog/dive-into-llms',
      },
      {
        name: 'Math-reasoning lab requirements',
        url: 'https://github.com/Lordog/dive-into-llms/blob/main/documents/chapter4/README.md',
      },
      {
        name: 'GUI-agent training path',
        url: 'https://github.com/Lordog/dive-into-llms/blob/main/documents/chapter9/README.md',
      },
      {
        name: 'Data-loader issue',
        url: 'https://github.com/Lordog/dive-into-llms/issues/28',
      },
      {
        name: 'Missing multimodal assets issue',
        url: 'https://github.com/Lordog/dive-into-llms/issues/26',
      },
      {
        name: 'macOS MPS compatibility issue',
        url: 'https://github.com/Lordog/dive-into-llms/issues/13',
      },
    ],
  },
  'diegosouzapw/OmniRoute': {
    homepage: 'https://omniroute.online',
    bestFor:
      'Developers who want coding agents and OpenAI-compatible clients to share one local gateway across multiple model providers, quotas, subscriptions, and free tiers.',
    confidence: 'high',
    rankBasis:
      'OmniRoute is popular because it replaces provider-by-provider client configuration, quota watching, and manual failover with one OpenAI-compatible endpoint that can translate requests and route them across a large provider catalog. Quota tracking, circuit breakers, fallback strategies, and optional context compression keep coding sessions moving when a provider fails or a limit is exhausted, while desktop, Docker, CLI, MCP, and agent integrations make the gateway immediately usable; roughly 28k stars confirm that developers value this control layer between their tools and changing model backends.',
    pricing: 'Free and open source; provider costs vary',
    pricingFree:
      'Free & open-source (MIT; self-hosted gateway, desktop app, CLI, and MCP). Model access follows each configured provider’s free-tier limits and terms',
    pricingPaid: null,
    features: [
      'One OpenAI-compatible endpoint with request translation across model-provider APIs',
      'Quota-aware fallback, circuit breakers, provider health, and configurable routing strategies',
      'RTK and Caveman compression for reducing eligible context and tool-output tokens',
      'Desktop, Docker, CLI, MCP, A2A, and coding-agent integrations',
    ],
    pros: [
      'Protocol translation and a shared provider registry let coding tools switch among OpenAI-, Anthropic-, Gemini-, and provider-specific backends without rewriting every client configuration',
      'Quota accounting, health checks, circuit breakers, and fallback strategies route around exhausted or failing providers, reducing interruptions during long agent sessions',
      'Compression stages target large tool outputs and repeated context before forwarding requests, allowing limited provider quotas and context windows to support more work',
    ],
    cons: [
      'The fast-changing provider catalog can drift from its marketing claims: issue #8007 blocked a release because the README free-token headline no longer matched the live catalog calculation',
      'The Windows desktop persistence path has a severe cold-restart failure: issue #7132 reproduces sql.js running out of memory when reopening a newly created SQLite database of about 1.6 MB',
      'Provider compatibility is not uniform across new model families, and issue #6778 reports the GPT-5.6 Codex family failing through the ChatGPT-account route; the official free-tier audit also flags many providers whose terms restrict proxy or third-party use',
    ],
    sources: [
      {
        name: 'Repository and product overview',
        url: 'https://github.com/diegosouzapw/OmniRoute',
      },
      {
        name: 'Provider registry',
        url: 'https://github.com/diegosouzapw/OmniRoute/tree/main/open-sse/config/providers',
      },
      {
        name: 'Free-tier audit and terms caveats',
        url: 'https://github.com/diegosouzapw/OmniRoute/blob/main/docs/reference/FREE_TIERS.md',
      },
      {
        name: 'Release documentation drift issue',
        url: 'https://github.com/diegosouzapw/OmniRoute/issues/8007',
      },
      {
        name: 'Windows restart failure',
        url: 'https://github.com/diegosouzapw/OmniRoute/issues/7132',
      },
      {
        name: 'Codex model compatibility issue',
        url: 'https://github.com/diegosouzapw/OmniRoute/issues/6778',
      },
    ],
  },
  'OtterMind/Chat2DB': {
    homepage: 'https://chat2db.ai',
    bestFor:
      'Developers, DBAs, and analysts who want one local desktop or web workspace for querying, managing, visualizing, and using their own AI model across many database engines.',
    confidence: 'high',
    rankBasis:
      'Chat2DB is popular because it consolidates the fragmented database-client workflow into one cross-platform workspace: more than 30 database plugins feed a common SQL editor, metadata browser, object manager, import/export flow, charts, and ER diagrams, while a bring-your-own-model assistant generates and explains SQL without requiring a bundled AI subscription. The local-first desktop and Docker options lower adoption friction for both traditional database work and AI-assisted querying; roughly 26k stars confirm the appeal of a broad database IDE with AI integrated into the same context.',
    pricing: 'Free Community edition; paid editions available',
    pricingFree:
      'Free Community edition for personal, educational, non-profit, and organizational internal use under LicenseRef-Chat2DB; it is source-available, not OSI open source',
    pricingPaid:
      'Paid Pro and Enterprise editions available; no public entry price verified. Commercial authorization is required for managed delivery, external services, OEM, embedding, and object-form redistribution',
    features: [
      'Plugin-based support for 30+ relational, analytical, document, cache, and cloud databases',
      'SQL editing, completion, execution history, metadata browsing, object management, and data editing',
      'Bring-your-own-model SQL generation, explanation, and optimization',
      'Import/export, charts, dashboards, ER diagrams, desktop, web, Docker, CLI, and MCP workflows',
    ],
    pros: [
      'Database plugins normalize engine-specific metadata, syntax, and object operations behind one workspace, so users can move among heterogeneous systems without learning a separate client for each one',
      'Community mode runs locally and connects to a user-selected model, keeping database credentials and query context on the user-controlled machine rather than requiring a hosted Chat2DB account',
      'Datasource passwords and AI keys are encrypted with AES-256-GCM and a per-installation key, protecting stored secrets from disclosure through the application data files alone',
    ],
    cons: [
      'Community mode is explicitly single-user and has no accounts or authorization boundaries; the official README says its HTTP service must remain bound to loopback rather than exposed to other users or untrusted networks',
      'Secret recovery depends on one installation key: losing or replacing it makes saved datasource passwords and AI API keys unreadable',
      'The current codebase has concrete integrity and security reports: issue #1914 identifies 34 SQL-injection paths across database plugins, issue #1833 shows OpenAI-compatible SSE parsing failing on a `data:` prefix, and issue #2049 shows deleted saved records reappearing after restart',
    ],
    sources: [
      {
        name: 'Community product and security overview',
        url: 'https://github.com/OtterMind/Chat2DB',
      },
      {
        name: 'Community 5.3+ license',
        url: 'https://github.com/OtterMind/Chat2DB/blob/main/LICENSE',
      },
      {
        name: 'Database plugin architecture',
        url: 'https://github.com/OtterMind/Chat2DB/tree/main/chat2db-community-server/chat2db-community-plugins',
      },
      {
        name: 'SQL injection report',
        url: 'https://github.com/OtterMind/Chat2DB/issues/1914',
      },
      {
        name: 'OpenAI-compatible streaming issue',
        url: 'https://github.com/OtterMind/Chat2DB/issues/1833',
      },
      {
        name: 'Deleted-record persistence issue',
        url: 'https://github.com/OtterMind/Chat2DB/issues/2049',
      },
    ],
  },
}
