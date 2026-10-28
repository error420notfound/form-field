import * as migration_20261027_000000_pdp_sections from './20261027_000000_pdp_sections';
import * as migration_20261027_000001_variant_images from './20261027_000001_variant_images';
import * as migration_20261028_000002_pdp_text_alignment from './20261028_000002_pdp_text_alignment';
import * as migration_20261028_000003_homepage_text_placement from './20261028_000003_homepage_text_placement';
import * as migration_20261028_000004_upsell_products from './20261028_000004_upsell_products';
import * as migration_20261028_123154_commerce_dashboard from './20261028_123154_commerce_dashboard';
import * as migration_20261028_130745_management_platform from './20261028_130745_management_platform';
import * as migration_20261028_000005_medusa_product_link from './20261028_000005_medusa_product_link';

export const migrations = [
  {
    up: migration_20261027_000000_pdp_sections.up,
    down: migration_20261027_000000_pdp_sections.down,
    name: '20261027_000000_pdp_sections',
  },
  {
    up: migration_20261027_000001_variant_images.up,
    down: migration_20261027_000001_variant_images.down,
    name: '20261027_000001_variant_images',
  },
  {
    up: migration_20261028_000002_pdp_text_alignment.up,
    down: migration_20261028_000002_pdp_text_alignment.down,
    name: '20261028_000002_pdp_text_alignment',
  },
  {
    up: migration_20261028_000003_homepage_text_placement.up,
    down: migration_20261028_000003_homepage_text_placement.down,
    name: '20261028_000003_homepage_text_placement',
  },
  {
    up: migration_20261028_000004_upsell_products.up,
    down: migration_20261028_000004_upsell_products.down,
    name: '20261028_000004_upsell_products',
  },
  {
    up: migration_20261028_123154_commerce_dashboard.up,
    down: migration_20261028_123154_commerce_dashboard.down,
    name: '20261028_123154_commerce_dashboard',
  },
  {
    up: migration_20261028_130745_management_platform.up,
    down: migration_20261028_130745_management_platform.down,
    name: '20261028_130745_management_platform'
  },
  { up: migration_20261028_000005_medusa_product_link.up, down: migration_20261028_000005_medusa_product_link.down, name: '20261028_000005_medusa_product_link' },
];
