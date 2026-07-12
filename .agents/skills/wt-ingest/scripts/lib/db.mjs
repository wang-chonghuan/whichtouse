// DB writer for wt-ingest. Reuses the app's connection contract:
// per-project schema "whichtouse-schema", conn from EASYAPP_DATABASE_URL / DATABASE_URL.
import postgres from 'postgres'

let _sql = null
export function sql() {
  if (_sql) return _sql
  const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
  _sql = postgres(url, {
    ssl: 'require',
    max: 4,
    idle_timeout: 20,
    connect_timeout: 15,
    connection: { search_path: '"whichtouse-schema"' },
  })
  return _sql
}

export async function getCategory(slug) {
  const rows = await sql()`select id, slug, name from categories where slug = ${slug}`
  return rows[0] || null
}

// Upsert one item by (category_id, dedup_key). Tracks never overlap: an item
// keeps its first form_factor unless re-investigated.
export async function upsertItem(it) {
  const rows = await sql()`
    insert into items (category_id, form_factor, name, url, homepage, pricing,
                       overall_signal, growth_signal, badge, dedup_key, source)
    values (${it.category_id}, ${it.form_factor}, ${it.name}, ${it.url ?? null},
            ${it.homepage ?? null}, ${it.pricing ?? null}, ${it.overall_signal ?? null},
            ${it.growth_signal ?? null}, ${'provisional'}, ${it.dedup_key}, ${it.source ?? null})
    on conflict (category_id, dedup_key) do update set
      name = excluded.name,
      form_factor = excluded.form_factor,
      url = excluded.url,
      homepage = excluded.homepage,
      pricing = excluded.pricing,
      overall_signal = excluded.overall_signal,
      growth_signal = excluded.growth_signal,
      source = excluded.source
    returning id`
  return rows[0].id
}

export async function close() {
  if (_sql) await _sql.end({ timeout: 5 })
}
