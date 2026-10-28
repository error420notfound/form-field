import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `products_pdp_sections` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` text PRIMARY KEY NOT NULL,\n\t`section_id` text,\n\t`variant` text,\n\t`label` text,\n\t`heading` text,\n\t`copy` text,\n\t`media_id` integer,\n\t`caption` text,\n\t`modal_label` text,\n\t`modal_copy` text,\n\tFOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_order_idx` ON `products_pdp_sections` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_parent_id_idx` ON `products_pdp_sections` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_media_idx` ON `products_pdp_sections` (`media_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `products_pdp_sections_cards` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` text NOT NULL,\n\t`id` text PRIMARY KEY NOT NULL,\n\t`heading` text,\n\t`copy` text,\n\t`media_id` integer,\n\tFOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `products_pdp_sections`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_cards_order_idx` ON `products_pdp_sections_cards` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_cards_parent_id_idx` ON `products_pdp_sections_cards` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_cards_media_idx` ON `products_pdp_sections_cards` (`media_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `products_pdp_sections_callouts` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` text NOT NULL,\n\t`id` text PRIMARY KEY NOT NULL,\n\t`heading` text,\n\t`copy` text,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `products_pdp_sections`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_callouts_order_idx` ON `products_pdp_sections_callouts` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_pdp_sections_callouts_parent_id_idx` ON `products_pdp_sections_callouts` (`_parent_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `_products_v_version_pdp_sections` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` integer PRIMARY KEY NOT NULL,\n\t`section_id` text,\n\t`variant` text,\n\t`label` text,\n\t`heading` text,\n\t`copy` text,\n\t`media_id` integer,\n\t`caption` text,\n\t`modal_label` text,\n\t`modal_copy` text,\n\t`_uuid` text,\n\tFOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `_products_v`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_order_idx` ON `_products_v_version_pdp_sections` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_parent_id_idx` ON `_products_v_version_pdp_sections` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_media_idx` ON `_products_v_version_pdp_sections` (`media_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `_products_v_version_pdp_sections_cards` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` integer PRIMARY KEY NOT NULL,\n\t`heading` text,\n\t`copy` text,\n\t`media_id` integer,\n\t`_uuid` text,\n\tFOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `_products_v_version_pdp_sections`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_cards_order_idx` ON `_products_v_version_pdp_sections_cards` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_cards_parent_id_idx` ON `_products_v_version_pdp_sections_cards` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_cards_media_idx` ON `_products_v_version_pdp_sections_cards` (`media_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `_products_v_version_pdp_sections_callouts` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` integer PRIMARY KEY NOT NULL,\n\t`heading` text,\n\t`copy` text,\n\t`_uuid` text,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `_products_v_version_pdp_sections`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_callouts_order_idx` ON `_products_v_version_pdp_sections_callouts` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_pdp_sections_callouts_parent_id_idx` ON `_products_v_version_pdp_sections_callouts` (`_parent_id`)'))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql.raw('DROP TABLE IF EXISTS `_products_v_version_pdp_sections_callouts`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `_products_v_version_pdp_sections_cards`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `_products_v_version_pdp_sections`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `products_pdp_sections_callouts`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `products_pdp_sections_cards`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `products_pdp_sections`'))
}
