import { readFile } from 'node:fs/promises'
import path from 'node:path'

type OdooVariant = { id: number; product_tmpl_id: [number, string]; product_template_attribute_value_ids: number[]; lst_price: number; free_qty: number; sale_ok: boolean; active: boolean }
type OdooValue = { id: number; name: string; attribute_id: [number, string]; html_color: string | false; is_custom: boolean; ptav_active: boolean }
export type VariantOption = { attributeId: number; attribute: string; valueId: number; value: string; color?: string }
export type OdooConfiguration = { id: number; price: number; quantity: number; options: VariantOption[] }
export class UnsupportedConfiguration extends Error {}

async function mappingId(id: number | string) {
  let raw: string
  try { raw = await readFile(path.join(process.cwd(), 'data', 'odoo-products.json'), 'utf8') }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null; throw e }
  const mapping = JSON.parse(raw) as Record<string, number>
  const linked = mapping[String(id)]
  if (linked === undefined) return null
  if (!Number.isSafeInteger(linked) || linked < 1) throw new Error('Invalid product link')
  return linked
}
async function readOdoo<T>(model: string, domain: unknown[], fields: string[], limit: number): Promise<T[]> {
  const { ODOO_URL, ODOO_DATABASE, ODOO_API_KEY } = process.env
  const warehouseId = Number(process.env.ODOO_WAREHOUSE_ID || 1)
  if (!Number.isSafeInteger(warehouseId) || warehouseId < 1 || !ODOO_URL || !ODOO_DATABASE || !ODOO_API_KEY) throw new Error('Odoo is not configured')
  const response = await fetch(`${ODOO_URL.replace(/\/$/, '')}/json/2/${model}/search_read`, {
    method: 'POST', headers: { Authorization: `bearer ${ODOO_API_KEY}`, 'X-Odoo-Database': ODOO_DATABASE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, fields, context: { warehouse_id: warehouseId }, limit }), signal: AbortSignal.timeout(8000), cache: 'no-store',
  })
  if (!response.ok) throw new Error('Odoo request failed')
  const result: unknown = await response.json()
  if (!Array.isArray(result)) throw new Error('Invalid Odoo response')
  return result as T[]
}
const variantFields = ['id', 'product_tmpl_id', 'product_template_attribute_value_ids', 'lst_price', 'free_qty', 'sale_ok', 'active']
export async function linkedOdooConfigurations(id: number | string): Promise<{ anchorId: number; variants: OdooConfiguration[] } | null> {
  const anchorId = await mappingId(id)
  if (anchorId === null) return null
  const anchor = (await readOdoo<OdooVariant>('product.product', [['id', '=', anchorId]], variantFields, 1))[0]
  if (!anchor || !Array.isArray(anchor.product_tmpl_id) || !Number.isSafeInteger(anchor.product_tmpl_id[0])) throw new Error('Linked Odoo product unavailable')
  const templateId = anchor.product_tmpl_id[0]
  const lines = await readOdoo<{ attribute_id: [number, string] }>('product.template.attribute.line', [['product_tmpl_id', '=', templateId], ['active', '=', true]], ['attribute_id'], 501)
  if (lines.length > 500 || lines.some(line => !Array.isArray(line.attribute_id) || !Number.isSafeInteger(line.attribute_id[0]))) throw new Error('Invalid attribute lines')
  const attributeIds = [...new Set(lines.map(line => line.attribute_id[0]))]
  const attributeOrder = new Map(attributeIds.map((attributeId, index) => [attributeId, index]))
  const attributes = attributeIds.length ? await readOdoo<{ id: number; create_variant: string }>('product.attribute', [['id', 'in', attributeIds]], ['id', 'create_variant'], 501) : []
  if (attributes.length !== attributeIds.length) throw new Error('Product attributes unavailable')
  if (attributes.some(attribute => attribute.create_variant === 'no_variant')) throw new UnsupportedConfiguration('This product has options that are not yet supported by the configurator.')
  const variants = await readOdoo<OdooVariant>('product.product', [['product_tmpl_id', '=', templateId], ['sale_ok', '=', true], ['active', '=', true]], variantFields, 501)
  if (variants.length > 500) throw new Error('Too many configurations')
  const valueIds = [...new Set(variants.flatMap(v => v.product_template_attribute_value_ids || []))]
  const values = valueIds.length ? await readOdoo<OdooValue>('product.template.attribute.value', [['id', 'in', valueIds], ['product_tmpl_id', '=', templateId]], ['id', 'name', 'attribute_id', 'html_color', 'is_custom', 'ptav_active'], 1001) : []
  if (values.length > 1000) throw new Error('Too many attribute values')
  const result = variants.flatMap(v => {
    if (!Number.isSafeInteger(v.id) || !Array.isArray(v.product_tmpl_id) || v.product_tmpl_id[0] !== templateId || !v.active || !v.sale_ok || !Number.isFinite(v.lst_price) || v.lst_price < 0 || !Number.isFinite(v.free_qty) || !Array.isArray(v.product_template_attribute_value_ids)) return []
    const matched = v.product_template_attribute_value_ids.map(valueId => values.find(value => value.id === valueId))
    if (matched.some(value => !value || !value.ptav_active || value.is_custom || !Array.isArray(value.attribute_id) || !attributeOrder.has(value.attribute_id[0]))) return []
    matched.sort((a, b) => attributeOrder.get(a!.attribute_id[0])! - attributeOrder.get(b!.attribute_id[0])!)
    const price = Math.round(v.lst_price * 100)
    if (!Number.isSafeInteger(price)) return []
    return [{ id: v.id, price, quantity: Math.max(0, v.free_qty), options: matched.map(value => ({ attributeId: value!.attribute_id[0], attribute: value!.attribute_id[1], valueId: value!.id, value: value!.name, ...(typeof value!.html_color === 'string' && /^#[0-9a-f]{6}$/i.test(value!.html_color) ? { color: value!.html_color } : {}) })) }]
  })
  return { anchorId, variants: result }
}
export async function linkedOdooProduct(id: number | string, variantId?: number) {
  const configs = await linkedOdooConfigurations(id)
  if (!configs) return null
  const selected = configs.variants.find(v => v.id === (variantId ?? configs.anchorId))
  return selected || null
}
