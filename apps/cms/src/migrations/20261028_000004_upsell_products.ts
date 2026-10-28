import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

// Payload stores product relationships by field path in the existing products_rels
// and _products_v_rels tables. This field requires no physical schema change.
export async function up(_args: MigrateUpArgs): Promise<void> {}
export async function down(_args: MigrateDownArgs): Promise<void> {}
