// D4: recompute rankings from items.
//   overall  = per category x track (app/skill/repo), top 10 by overall_signal
//   growth   = per category x track, top 5 by growth_signal
//   best3    = top-1 of each track by overall, ordered within category by
//              within-track normalized signal (covers all form factors)
// Usage:  EASYAPP_DATABASE_URL=... node scripts/rank.mjs
import { sql, close } from './lib/db.mjs'

const OVERALL = `
insert into rankings (category_id, form_factor, dimension, item_id, rank)
select category_id, form_factor, 'overall', id, rn from (
  select category_id, form_factor, id,
         row_number() over (partition by category_id, form_factor order by overall_signal desc nulls last, id) rn
  from items where overall_signal is not null
) t where rn <= 10`

const GROWTH = `
insert into rankings (category_id, form_factor, dimension, item_id, rank)
select category_id, form_factor, 'growth', id, rn from (
  select category_id, form_factor, id,
         row_number() over (partition by category_id, form_factor order by growth_signal desc nulls last, id) rn
  from items where growth_signal is not null
) t where rn <= 5`

const BEST3 = `
insert into rankings (category_id, form_factor, dimension, item_id, rank)
select category_id, 'best3', 'overall', item_id,
       row_number() over (partition by category_id order by norm desc nulls last, item_id)
from (
  select i.category_id, i.id item_id,
         i.overall_signal::float
           / nullif(max(i.overall_signal) over (partition by i.category_id, i.form_factor), 0) norm,
         row_number() over (partition by i.category_id, i.form_factor order by i.overall_signal desc nulls last, i.id) track_rank
  from items i where i.overall_signal is not null
) x where track_rank = 1`

async function main() {
  await sql().begin(async (tx) => {
    await tx`delete from rankings`
    await tx.unsafe(OVERALL)
    await tx.unsafe(GROWTH)
    await tx.unsafe(BEST3)
  })
  const [{ count }] = await sql()`select count(*)::int as count from rankings`
  console.log(`rankings recomputed: ${count} rows`)
  await close()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
