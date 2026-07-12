-- WhichToUse — database schema (single source of truth)
--
-- Per-project schema on the shared Azure easy-app Postgres: "whichtouse-schema".
-- Applied with search_path = "whichtouse-schema" (see app/src/lib/db.ts).
-- Phase 1 (MVP): use-case categories × form-factor items × two-dimension rankings.

-- Business use-case categories (the site's primary axis).
create table if not exists categories (
  id          serial primary key,
  slug        text unique not null,
  name        text not null,
  money_tier  text not null default 'green'   -- green | yellow | red (affiliate potential)
              check (money_tier in ('green','yellow','red')),
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Products/tools. Each item belongs to exactly ONE form factor (tracks never overlap).
create table if not exists items (
  id             serial primary key,
  category_id    int  not null references categories(id) on delete cascade,
  form_factor    text not null check (form_factor in ('app','skill','repo')),
  name           text not null,
  url            text,                          -- canonical link (repo / product / skill)
  homepage       text,
  pricing        text,                          -- free | freemium | paid | open-source | ...
  overall_signal numeric,                       -- native popularity (stars / installs / votes)
  growth_signal  numeric,                       -- last-30d growth
  badge          text not null default 'provisional'
                 check (badge in ('provisional','sandbox-tested','free-tested','profiled')),
  dedup_key      text not null,                 -- repo url / domain — unique within a category
  source         text,                          -- where discovered / investigated
  created_at     timestamptz not null default now(),
  unique (category_id, dedup_key)
);

-- Rankings: category × track × dimension → ordered items.
-- form_factor 'best3' holds the cross-form-factor overall Best 3.
create table if not exists rankings (
  id           serial primary key,
  category_id  int  not null references categories(id) on delete cascade,
  form_factor  text not null check (form_factor in ('app','skill','repo','best3')),
  dimension    text not null check (dimension in ('overall','growth')),
  item_id      int  not null references items(id) on delete cascade,
  rank         int  not null,
  computed_at  timestamptz not null default now(),
  unique (category_id, form_factor, dimension, rank)
);

create index if not exists idx_items_category on items(category_id);
create index if not exists idx_rankings_lookup on rankings(category_id, form_factor, dimension, rank);
