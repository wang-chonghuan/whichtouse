-- WhichToUse — database schema (single source of truth)
--
-- Per-project schema on the shared Azure easy-app Postgres: "whichtouse-schema".
-- Applied with search_path = "whichtouse-schema" (see app/src/lib/db.ts).
--
-- Design: specs/content-in-db.md. Two tables, natural keys, no history.
-- Every scheduled run overwrites in place — order is a function of today's
-- aggregated inputs, not of anything we recorded ourselves.

drop table if exists rankings   cascade;   -- superseded (signal-driven design)
drop table if exists items      cascade;   -- superseded
drop table if exists listings   cascade;
drop table if exists categories cascade;

create table categories (
  slug         text primary key,
  name         text not null,
  money_tier   text not null default 'green'
               check (money_tier in ('green','yellow','red')),
  sort         int  not null default 0,
  note         text,                     -- per-category prose

  -- "Before you pick": how to choose in this category, not which product to
  -- choose. Researched per category and authored; deliberately NOT written by
  -- the refresh job, which may never author prose. Three separate columns
  -- rather than one blob so a half-answered category is visible in a query.
  pick_weigh   text,                     -- what actually decides the choice
  pick_avoid   text,                     -- the pitfall specific to this class
  pick_moving  text,                     -- where the category's capabilities are going
  pick_sources jsonb not null default '[]',
  pick_updated_at timestamptz,           -- these decay; this is the review clock

  refreshed_at timestamptz,              -- last successful refresh run
  updated_at   timestamptz not null default now()
);

-- Every "Before you pick" investigation, appended and never updated.
--
-- `categories.pick_*` holds the *published* answer — one row, overwritten on
-- each publish, and what the card renders collapsed. This table holds the
-- record: every run ever made, plus the expanded prose the card reveals when a
-- reader opens it. Rows are only ever inserted.
create table before_you_pick_runs (
  id            bigserial primary key,

  -- slug joins; code is the stable identity; name is what was displayed.
  -- Three columns for what looks like one thing, because they drift apart:
  -- a slug is a URL and may be short, a display name gets rewritten for tone,
  -- and neither should silently change what a historical row refers to.
  category_slug text not null references categories(slug) on delete cascade,
  category_code text not null,             -- lower-case, hyphen-joined, from the name at write time
  category_name text not null,

  -- The three lines the card renders collapsed: {weigh, avoid, moving}.
  -- Any may be null — an unsupported line is stored as null, never as filler.
  byp_summary   jsonb not null,

  -- Reader-facing. What "View all" reveals: for each of the three, a few
  -- sentences giving the mechanism, what it means when choosing, and what to
  -- do about it. Shaped {weigh:{detail}, avoid:{detail}, moving:{detail}}.
  -- Empty until a category has been through an expansion pass.
  byp_details   jsonb not null default '{}',

  -- Machinery, never shown to a reader: the brief the researcher was given,
  -- the sources returned, and any editorial change made before publication.
  meta          jsonb not null default '{}',

  batch_id      int not null,
  created_at    timestamptz not null default now()
);

create index on before_you_pick_runs (category_slug, batch_id);

create table listings (
  category_slug text not null references categories(slug) on delete cascade,
  tool_slug     text not null,

  -- identity
  name           text not null,
  owner          text,                   -- null for hosted products
  track          text not null check (track in ('saas','oss','skill')),
  homepage       text,
  repo_full_name text,                   -- 'owner/repo' — drives GitHub polling
  package_name   text,                   -- npm / PyPI name — drives download polling

  -- placement. machine-owned for leading/emerging, human-set for watchlist.
  standing text not null check (standing in ('leading','emerging','watchlist')),
  rank     int,                          -- null for watchlist

  -- What the source said about itself: a GitHub repo description, a Product
  -- Hunt tagline. Captured at discovery so a machine-placed row is not a bare
  -- name, and kept apart from `best_for` on purpose — this is the vendor's own
  -- copy, unread by us, and it must never render where a checked line renders.
  -- It is raw material for the pass that writes `best_for`, nothing more.
  source_description text,

  -- editorial, human-owned. All null on a machine-discovered row.
  reviewed_at timestamptz,               -- null = ranked by aggregation, never opened
  summary     text,
  edge        text,
  con         text,
  best_for    text,
  -- Why this sits where it sits, in prose. The design doc argued `evidence`
  -- replaces this once ranking is algorithmic — true for a machine-placed row,
  -- false for the 374 authored ones, every single of which has a distinct
  -- rank_basis. Dropping it made the detail panel print its own description
  -- twice. Machine rows leave it null and render `evidence` instead.
  rank_basis  text,
  features    jsonb not null default '[]',
  pros        jsonb not null default '[]',
  cons        jsonb not null default '[]',
  sources     jsonb not null default '[]',   -- [{name, url}]
  confidence  text check (confidence in ('high','medium','low')),

  -- pricing. timestamped separately because it rots fastest and is the error
  -- visitors punish hardest.
  pricing_model      text,
  pricing_free       text,
  pricing_paid       text,
  pricing_checked_at timestamptz,

  -- machine-owned, overwritten every run
  -- { score, sources: [{site, rank, url}], metrics: {stars, downloads_year, ...} }
  evidence     jsonb not null default '{}',
  refreshed_at timestamptz,

  updated_at timestamptz not null default now(),

  primary key (category_slug, tool_slug),

  -- Includes track: leading #1 must be able to exist once per track.
  -- Deferred so the refresh job can rewrite a whole standing inside one
  -- transaction without tripping over intermediate states.
  constraint uq_rank unique (category_slug, track, standing, rank)
    deferrable initially deferred
);

create index idx_listings_placement  on listings (category_slug, track, standing, rank);
create index idx_listings_unreviewed on listings (reviewed_at) where reviewed_at is null;
create index idx_listings_repo       on listings (repo_full_name) where repo_full_name is not null;
