import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Earlier migrations predate a schema snapshot. Add only the new schema.
  const add = async (table: string, column: string, definition: string) => {
    const rows = await db.all(sql.raw(`PRAGMA table_info(\`${table}\`)`)) as { name: string }[]
    if (!rows.some(row => row.name === column)) await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`))
  }
  await add('orders', 'demo_seed', 'text')
  await add('orders', 'operations', 'text')
  await db.run(sql.raw("CREATE TABLE IF NOT EXISTS `inventory_snapshots` (`id` integer PRIMARY KEY NOT NULL, `name` text NOT NULL, `product_id` numeric, `source` text NOT NULL, `demo_seed` text, `quantity` numeric NOT NULL, `price` numeric, `observed_at` text NOT NULL, `sync_error` text, `updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), `created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))"))
  await add('payload_locked_documents_rels', 'inventory_snapshots_id', 'integer REFERENCES `inventory_snapshots`(`id`) ON DELETE cascade')
  for (const [table, column] of [['orders', 'demo_seed'], ['inventory_snapshots', 'demo_seed'], ['inventory_snapshots', 'updated_at'], ['inventory_snapshots', 'created_at'], ['payload_locked_documents_rels', 'inventory_snapshots_id']])
    await db.run(sql.raw(`CREATE INDEX IF NOT EXISTS \`${table}_${column}_idx\` ON \`${table}\` (\`${column}\`)`))
}
// Data-preserving rollback: retain added data and columns.
export async function down(_args: MigrateDownArgs): Promise<void> {}
