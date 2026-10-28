import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, column] of [['products', 'medusa_product_id'], ['_products_v', 'version_medusa_product_id']] as const) {
    const columns = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${table}\`)`))
    if (!columns.some(item => item.name === column)) await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` text`))
  }
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS products_medusa_product_id_idx ON products (medusa_product_id)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS _products_v_version_medusa_product_id_idx ON _products_v (version_medusa_product_id)`)
}
export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Preserve Medusa product associations. Back up and explicitly plan column removal before rolling back this additive migration.')
}
