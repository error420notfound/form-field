import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules, ProductStatus, MedusaError } from '@medusajs/framework/utils'
import { createProductsWorkflow, createInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Disposable integration merchandise. Never run against a production database. */
export default async function fixture({ container }: ExecArgs) {
  if (process.env.NODE_ENV === 'production') throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Development fixtures are disabled in production.')
  const directory = path.resolve(process.cwd(), '../../.local')
  const config = JSON.parse(readFileSync(path.join(directory, 'commerce-public.json'), 'utf8')) as { channelId: string; locationId: string }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventory = container.resolve(Modules.INVENTORY)
  const { data: existing } = await query.graph({ entity: 'product', fields: ['id', 'metadata'], filters: { handle: 'formfield-commerce-fixture' } })
  let productId = existing[0]?.id
  if (productId && existing[0].metadata?.formfieldDevelopmentFixture !== true) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Fixture handle belongs to another product. Nothing changed.')
  if (!productId) {
    const { result } = await createProductsWorkflow(container).run({ input: { products: [{
      title: 'Development commerce fixture', handle: 'formfield-commerce-fixture', status: ProductStatus.PUBLISHED,
      description: 'Disposable integration test record. Prices and stock are synthetic test values; this is not merchandise.',
      metadata: { formfieldDevelopmentFixture: true }, sales_channels: [{ id: config.channelId }],
      options: [{ title: 'Test configuration', values: ['A', 'B'] }],
      variants: [
        { title: 'Test A', sku: 'FF-DEV-MEDUSA-A', manage_inventory: true, allow_backorder: false, options: { 'Test configuration': 'A' }, prices: [{ currency_code: 'inr', amount: 123.45 }] },
        { title: 'Test B', sku: 'FF-DEV-MEDUSA-B', manage_inventory: true, allow_backorder: false, options: { 'Test configuration': 'B' }, prices: [{ currency_code: 'inr', amount: 234.56 }] },
      ],
    }] } })
    productId = result[0].id
  }
  const { data: [product] } = await query.graph({ entity: 'product', fields: ['id', 'variants.id', 'variants.inventory_items.inventory_item_id'], filters: { id: productId } })
  for (const variant of product.variants || []) for (const linked of variant.inventory_items || []) {
    if (!linked?.inventory_item_id) continue
    const [level] = await inventory.listInventoryLevels({ inventory_item_id: linked.inventory_item_id, location_id: config.locationId })
    if (!level) await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: [{ inventory_item_id: linked.inventory_item_id, location_id: config.locationId, stocked_quantity: 10 }] } })
  }
  writeFileSync(path.join(directory, 'medusa-fixture.json'), JSON.stringify({ productId, variantIds: product.variants?.map(variant => variant.id), slug: 'formfield-commerce-fixture' }, null, 2), { mode: 0o600 })
  container.resolve(ContainerRegistrationKeys.LOGGER).info('Labeled development fixture ready (synthetic INR prices and ten test units per variant). Existing quantities preserved on repeat runs. No orders or customers created.')
}
