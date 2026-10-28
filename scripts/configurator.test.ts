import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { linkedOdooConfigurations, linkedOdooProduct } from '../apps/cms/src/odoo-product.ts'

const previous = process.cwd()
const originalFetch = globalThis.fetch
const dir = await mkdtemp(path.join(tmpdir(), 'form-field-variants-'))
await mkdir(path.join(dir, 'data'))
await writeFile(path.join(dir, 'data/odoo-products.json'), JSON.stringify({ 7: 100 }))
process.chdir(dir)
process.env.ODOO_URL = 'http://localhost:8069'
process.env.ODOO_DATABASE = 'test'
process.env.ODOO_API_KEY = 'test'
const anchor = { id: 100, product_tmpl_id: [50, 'Lamp'], product_template_attribute_value_ids: [1, 3], lst_price: 120, free_qty: 4, sale_ok: true, active: true }
const other = { ...anchor, id: 101, product_template_attribute_value_ids: [2, 3], lst_price: 145, free_qty: 2 }
const values = [
  { id: 1, name: 'Silver', attribute_id: [10, 'Colour'], html_color: '#eeeeee', is_custom: false, ptav_active: true },
  { id: 2, name: 'Black', attribute_id: [10, 'Colour'], html_color: '#222222', is_custom: false, ptav_active: true },
  { id: 3, name: 'Small', attribute_id: [11, 'Size'], html_color: false, is_custom: false, ptav_active: true },
]
globalThis.fetch = async (input, init) => {
  const url = String(input)
  const body = JSON.parse(String(init?.body))
  if (url.includes('product.template.attribute.line')) return Response.json([{ attribute_id: [10, 'Colour'] }, { attribute_id: [11, 'Size'] }])
  if (url.includes('product.attribute/')) return Response.json([{ id: 10, create_variant: 'always' }, { id: 11, create_variant: 'always' }])
  if (url.includes('product.template.attribute.value')) return Response.json(values)
  if (url.includes('product.product')) return Response.json(body.domain[0][0] === 'id' ? [anchor] : [anchor, other])
  throw new Error('Unexpected Odoo model')
}
after(async () => { process.chdir(previous); globalThis.fetch = originalFetch; await rm(dir, { recursive: true, force: true }) })
test('resolves sibling variants and uses variant price and stock', async () => {
  const configs = await linkedOdooConfigurations(7)
  assert.equal(configs?.anchorId, 100)
  assert.equal(configs?.variants.length, 2)
  assert.deepEqual(configs?.variants[1].options.map(o => o.value), ['Black', 'Small'])
  assert.equal(configs?.variants[1].price, 14500)
  assert.equal(configs?.variants[1].quantity, 2)
})
test('legacy selection resolves to the linked anchor and arbitrary IDs are rejected', async () => {
  assert.equal((await linkedOdooProduct(7))?.id, 100)
  assert.equal(await linkedOdooProduct(7, 999), null)
  assert.equal(await linkedOdooConfigurations(8), null)
})
test('custom or inactive option values do not become sellable choices', async () => {
  values[1].is_custom = true
  const configs = await linkedOdooConfigurations(7)
  assert.deepEqual(configs?.variants.map(v => v.id), [100])
  values[1].is_custom = false
})
test('single-configuration products can be selected without option groups', async () => {
  globalThis.fetch = async input => String(input).includes('product.template.attribute.line') ? Response.json([]) : Response.json([{ ...anchor, product_template_attribute_value_ids: [] }])
  const configs = await linkedOdooConfigurations(7)
  assert.equal(configs?.variants.length, 1)
  assert.deepEqual(configs?.variants[0].options, [])
})
test('Odoo errors fail closed rather than producing a price or stock', async () => {
  globalThis.fetch = async () => new Response('unavailable', { status: 503 })
  await assert.rejects(() => linkedOdooConfigurations(7), /Odoo request failed/)
})

test('unsupported non-variant options block configuration rather than being silently omitted', async () => {
  globalThis.fetch = async input => {
    const url = String(input)
    if (url.includes('product.template.attribute.line')) return Response.json([{ attribute_id: [15, 'Engraving'] }])
    if (url.includes('product.attribute/')) return Response.json([{ id: 15, create_variant: 'no_variant' }])
    return Response.json([anchor])
  }
  await assert.rejects(() => linkedOdooConfigurations(7), /not yet supported/)
})
