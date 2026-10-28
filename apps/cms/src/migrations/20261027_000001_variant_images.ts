import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `products_variant_images` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` text PRIMARY KEY NOT NULL,\n\t`odoo_variant_id` numeric,\n\t`image_id` integer,\n\tFOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_variant_images_order_idx` ON `products_variant_images` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_variant_images_parent_id_idx` ON `products_variant_images` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `products_variant_images_image_idx` ON `products_variant_images` (`image_id`)'))
  await db.run(sql.raw('CREATE TABLE IF NOT EXISTS `_products_v_version_variant_images` (\n\t`_order` integer NOT NULL,\n\t`_parent_id` integer NOT NULL,\n\t`id` integer PRIMARY KEY NOT NULL,\n\t`odoo_variant_id` numeric,\n\t`image_id` integer,\n\t`_uuid` text,\n\tFOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,\n\tFOREIGN KEY (`_parent_id`) REFERENCES `_products_v`(`id`) ON UPDATE no action ON DELETE cascade\n)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_variant_images_order_idx` ON `_products_v_version_variant_images` (`_order`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_variant_images_parent_id_idx` ON `_products_v_version_variant_images` (`_parent_id`)'))
  await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `_products_v_version_variant_images_image_idx` ON `_products_v_version_variant_images` (`image_id`)'))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql.raw('DROP TABLE IF EXISTS `_products_v_version_variant_images`'))
  await db.run(sql.raw('DROP TABLE IF EXISTS `products_variant_images`'))
}
