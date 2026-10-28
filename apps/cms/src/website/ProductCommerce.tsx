import React from 'react'
import type { ServerProps } from 'payload'
import { linkedOdooConfigurations } from '../odoo-product'
export default async function ProductCommerce({ id, payload }: ServerProps) {
  if (!id) return null
  try {
    const product = await payload.findByID({ collection: 'products', id, depth: 0 })
    if (product.medusaProductId) return <p>Medusa product: {product.medusaProductId}. Manage pricing, variants and stock in <a href="http://localhost:9000/app" target="_blank" rel="noreferrer">Medusa Admin</a>. Editorial content and media remain here. Changing this association does not migrate existing bags or orders.</p>
    const linked = await linkedOdooConfigurations(id)
    if (!linked) return <p>Odoo: this product is not linked. Link it in the local Odoo mapping before selling.</p>
    return <details><summary>Odoo configurations · live lookup</summary><p>Prices and stock are managed in Odoo. Availability is not a reservation.</p><ul>{linked.variants.map(variant => <li key={variant.id}>{variant.options.map(option=>`${option.attribute}: ${option.value}`).join(', ') || 'Default'} — {new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(variant.price/100)} · {variant.quantity} available</li>)}</ul></details>
  } catch { return <p role="status">Odoo price and inventory are unavailable. No fallback stock is shown.</p> }
}
