import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function linkedOdooProduct(id: number | string) {
  const mapping = JSON.parse(await readFile(path.join(process.cwd(), 'data', 'odoo-products.json'), 'utf8')) as Record<string, number>
  const odooId = mapping[String(id)]
  if (odooId === undefined) return null
  if (!Number.isSafeInteger(odooId) || odooId < 1) throw new Error('Invalid product link')
  const { ODOO_URL, ODOO_DATABASE, ODOO_API_KEY } = process.env
  const warehouseId = Number(process.env.ODOO_WAREHOUSE_ID || 1)
  if (!Number.isSafeInteger(warehouseId) || warehouseId < 1 || !ODOO_URL || !ODOO_DATABASE || !ODOO_API_KEY) throw new Error('Odoo is not configured')
  const response = await fetch(`${ODOO_URL.replace(/\/$/, '')}/json/2/product.product/search_read`, {
    method: 'POST',
    headers: { Authorization: `bearer ${ODOO_API_KEY}`, 'X-Odoo-Database': ODOO_DATABASE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: [['id', '=', odooId]], fields: ['free_qty', 'list_price'], context: { warehouse_id: warehouseId }, limit: 1 }),
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Odoo request failed')
  const products: { free_qty: number; list_price: number }[] = await response.json()
  const product = products[0]
  if (products.length !== 1 || !Number.isFinite(product.free_qty) || !Number.isFinite(product.list_price) || product.list_price < 0) throw new Error('Odoo product unavailable')
  const price = Math.round(product.list_price * 100)
  if (!Number.isSafeInteger(price)) throw new Error('Invalid Odoo price')
  return { id: odooId, quantity: Math.max(0, product.free_qty), price }
}
