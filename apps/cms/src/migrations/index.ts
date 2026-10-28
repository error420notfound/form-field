import * as pdpSections from './20261027_000000_pdp_sections'
import * as variantImages from './20261027_000001_variant_images'
import * as pdpAlignment from './20261028_000002_pdp_text_alignment'
import * as homepageTextPlacement from './20261028_000003_homepage_text_placement'
import * as upsellProducts from './20261028_000004_upsell_products'

export const migrations = [{ up: pdpSections.up, down: pdpSections.down, name: '20261027_000000_pdp_sections' }, { up: variantImages.up, down: variantImages.down, name: '20261027_000001_variant_images' }, { up: pdpAlignment.up, down: pdpAlignment.down, name: '20261028_000002_pdp_text_alignment' }, { up: homepageTextPlacement.up, down: homepageTextPlacement.down, name: '20261028_000003_homepage_text_placement' }, { up: upsellProducts.up, down: upsellProducts.down, name: '20261028_000004_upsell_products' }]
