import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

const columns = [ ['products', 'homepage_text_placement'], ['_products_v', 'version_homepage_text_placement'] ] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, column] of columns) {
    const existing = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${table}\`)`))
    if (!existing.some(item => item.name === column)) {
      await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` text DEFAULT 'above'`))
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, column] of columns) {
    const existing = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${table}\`)`))
    if (existing.some(item => item.name === column)) {
      await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``))
    }
  }
}
