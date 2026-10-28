import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const add = async (table: string, column: string, definition: string) => {
    const columns = await db.all(sql.raw(`PRAGMA table_info(\`${table}\`)`)) as { name: string }[]
    if (!columns.some(c => c.name === column)) await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`))
  }
  await add('users', 'role', "text NOT NULL DEFAULT 'owner'")
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`website_pages_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text,
  	\`label\` text,
  	\`heading\` text,
  	\`copy\` text,
  	\`link_text\` text,
  	\`link_url\` text,
  	\`media_id\` integer,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`website_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages_sections_order_idx\` ON \`website_pages_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages_sections_parent_id_idx\` ON \`website_pages_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages_sections_media_idx\` ON \`website_pages_sections\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`website_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`website_pages_slug_idx\` ON \`website_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages_updated_at_idx\` ON \`website_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages_created_at_idx\` ON \`website_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`website_pages__status_idx\` ON \`website_pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_website_pages_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text,
  	\`label\` text,
  	\`heading\` text,
  	\`copy\` text,
  	\`link_text\` text,
  	\`link_url\` text,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_website_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_sections_order_idx\` ON \`_website_pages_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_sections_parent_id_idx\` ON \`_website_pages_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_sections_media_idx\` ON \`_website_pages_v_version_sections\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_website_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`website_pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_parent_idx\` ON \`_website_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_version_slug_idx\` ON \`_website_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_version_updated_at_idx\` ON \`_website_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_version_created_at_idx\` ON \`_website_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_version_version__status_idx\` ON \`_website_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_created_at_idx\` ON \`_website_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_updated_at_idx\` ON \`_website_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`_website_pages_v_latest_idx\` ON \`_website_pages_v\` (\`latest\`);`)
  await add('payload_locked_documents_rels', 'website_pages_id', 'integer REFERENCES `website_pages`(`id`) ON DELETE cascade')
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `payload_locked_documents_rels_website_pages_id_idx` ON `payload_locked_documents_rels` (`website_pages_id`)'))
}
// Retain content and roles on rollback to avoid deleting user data.
export async function down(_args: MigrateDownArgs): Promise<void> {}
