import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

const tables = ['products_pdp_sections', '_products_v_version_pdp_sections'] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of tables) {
    const columns = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${table}\`)`))
    if (!columns.some(column => column.name === 'text_alignment')) {
      await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`text_alignment\` text DEFAULT 'left'`))
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of tables) {
    const columns = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(\`${table}\`)`))
    if (columns.some(column => column.name === 'text_alignment')) {
      await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`text_alignment\``))
    }
  }
}
