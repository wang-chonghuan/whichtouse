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
  refreshed_at timestamptz,              -- last successful refresh run
  updated_at   timestamptz not null default now()
);

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
