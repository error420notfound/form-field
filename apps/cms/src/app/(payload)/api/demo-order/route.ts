import config from '@payload-config'
import { getPayload } from 'payload'
import { linkedOdooProduct } from '../../../../odoo-product'
import { customerFromHeaders, syncCustomer } from '../../../../customer-service'

type Selection = { id: number; quantity: number }
type Customer = { name: string; email: string; address: string; apartment: string; city: string; postalCode: string; state: string; country: string }

async function odoo(model: string, method: string, body: object): Promise<any> {
  const base = process.env.ODOO_URL || ''
  const url = new URL(base)
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Local Odoo is required')
  if (!process.env.ODOO_API_KEY || !process.env.ODOO_DATABASE) throw new Error('Odoo is not configured')
  const response = await fetch(`${base.replace(/\/$/, '')}/json/2/${model}/${method}`, {
    method: 'POST', headers: { Authorization: `bearer ${process.env.ODOO_API_KEY}`, 'X-Odoo-Database': process.env.ODOO_DATABASE, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000), cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Odoo ${model}/${method} failed (HTTP ${response.status})`)
  return response.json()
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return Response.json({ error: 'Demo checkout is available only in local development.' }, { status: 403 })
  let body: { reference: string; customer: Customer; items: Selection[] }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }) }
  const { reference, customer, items } = body || {}
  const fields = ['name', 'email', 'address', 'city', 'postalCode', 'state', 'country'] as const
  if (typeof reference !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference) || !customer || fields.some(k => typeof customer[k] !== 'string' || !customer[k].trim() || customer[k].length > 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || (customer.apartment !== undefined && (typeof customer.apartment !== 'string' || customer.apartment.length > 200)) || !Array.isArray(items) || !items.length || items.length > 20 || items.some(i => !Number.isSafeInteger(i.id) || i.id < 1 || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99) || new Set(items.map(i => i.id)).size !== items.length)
    return Response.json({ error: 'Check your delivery details and bag.' }, { status: 400 })

  const payload = await getPayload({ config })
  const account = await customerFromHeaders(payload, request.headers)
  if (!account) return Response.json({ error: 'Please sign in before checkout.' }, { status: 401 })
  customer.email = account.email
  let linkedCustomerId: number
  try { linkedCustomerId = await syncCustomer(payload, account) }
  catch { return Response.json({ error: 'Your account could not connect to Odoo. Please try checkout again later.' }, { status: 503 }) }
  const existing = await payload.find({ collection: 'orders', where: { reference: { equals: reference } }, limit: 1, overrideAccess: true })
  if (existing.docs.length) return Response.json({ error: 'This order was already submitted. Check Orders in Payload before trying again.' }, { status: 409 })
  let lines: { id: number; name: string; quantity: number; odooId: number; unitPrice: number }[]
  try {
    lines = await Promise.all(items.map(async item => {
      const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0, overrideAccess: true })
      const remote = await linkedOdooProduct(item.id)
      if (!product || product._status !== 'published' || product.reviewOnly || product.purchaseEligible === false || product.availability !== 'available' || !remote || remote.quantity < item.quantity) throw new Error('A product is unavailable or has insufficient stock.')
      return { id: item.id, name: product.name, quantity: item.quantity, odooId: remote.id, unitPrice: remote.price }
    }))
  } catch { return Response.json({ error: 'A product is unavailable, unlinked, or has insufficient stock. Refresh your bag.' }, { status: 409 }) }
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  if (!Number.isSafeInteger(subtotal)) return Response.json({ error: 'Order total is invalid.' }, { status: 400 })
  let record
  try { record = await payload.create({ collection: 'orders', data: { reference, account: account.id, status: 'pending', paymentMethod: 'demo', paymentStatus: 'pending', customer, items: lines, subtotal }, overrideAccess: true }) }
  catch { return Response.json({ error: 'This order could not be started. Check Orders in Payload before retrying.' }, { status: 409 }) }
  let orderId: number | undefined
  try {
    const address = { street: customer.address.trim(), street2: customer.apartment?.trim() || '', city: customer.city.trim(), zip: customer.postalCode.trim(), comment: `Demo delivery state: ${customer.state.trim()}\nDemo delivery country: ${customer.country.trim()}` }
    const partnerId = linkedCustomerId
    const createdAddress = await odoo('res.partner', 'create', { vals_list: [{ parent_id: partnerId, type: 'delivery', name: customer.name.trim(), ...address }] })
    const shippingId = createdAddress[0]
    if (!Number.isSafeInteger(partnerId) || !Number.isSafeInteger(shippingId)) throw new Error('Unexpected Odoo customer response')
    await payload.update({ collection: 'orders', id: record.id, data: { odooCustomerId: partnerId }, overrideAccess: true })
    const warehouseId = Number(process.env.ODOO_WAREHOUSE_ID || 1)
    const teamId = Number(process.env.ODOO_SALES_TEAM_ID || 4)
    const created = await odoo('sale.order', 'create', { vals_list: [{ partner_id: partnerId, partner_shipping_id: shippingId, warehouse_id: warehouseId, team_id: teamId, client_order_ref: `DEMO-${reference}`, note: '<p>Demo payment simulation pending. No real payment is collected.</p>', order_line: lines.map(line => [0, 0, { product_id: line.odooId, name: line.name, product_uom_qty: line.quantity, price_unit: line.unitPrice / 100, tax_ids: [[5, 0, 0]] }]) }] })
    orderId = created[0]
    if (!Number.isSafeInteger(orderId)) throw new Error('Unexpected Odoo order response')
    await payload.update({ collection: 'orders', id: record.id, data: { odooOrderId: orderId }, overrideAccess: true })
    await odoo('sale.order', 'action_confirm', { ids: [orderId] })
    const orders = await odoo('sale.order', 'read', { ids: [orderId], fields: ['name', 'state', 'picking_ids'] })
    const order = orders[0]
    const pickings = order?.picking_ids?.length ? await odoo('stock.picking', 'read', { ids: order.picking_ids, fields: ['state', 'move_ids'] }) : []
    const moveIds = pickings.flatMap((p: { move_ids: number[] }) => p.move_ids)
    const moves = moveIds.length ? await odoo('stock.move', 'read', { ids: moveIds, fields: ['product_id', 'quantity', 'state'] }) : []
    const fullyReserved = order?.state === 'sale' && pickings.length > 0 && pickings.every((p: { state: string }) => p.state === 'assigned') && lines.every(line => moves.filter((m: { product_id: [number, string]; state: string }) => m.product_id[0] === line.odooId && m.state !== 'cancel').reduce((n: number, m: { quantity: number }) => n + m.quantity, 0) >= line.quantity)
    if (!fullyReserved) {
      await odoo('sale.order', 'action_cancel', { ids: [orderId] })
      throw new Error('Insufficient stock was reserved; Odoo order was cancelled.')
    }
    await odoo('sale.order', 'write', { ids: [orderId], vals: { note: '<p>Demo payment simulated successfully. No real payment was collected. Website reference: ' + reference + '</p>' } })
    await payload.update({ collection: 'orders', id: record.id, data: { status: 'confirmed', paymentStatus: 'simulated-success', odooReference: order.name }, overrideAccess: true })
    return Response.json({ reference, odooReference: order.name, paymentStatus: 'simulated-success', lines: lines.map(({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice })), subtotal }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const note = error instanceof Error ? error.message : 'Unknown order error'
    await payload.update({ collection: 'orders', id: record.id, data: { status: 'review', ...(orderId ? { odooOrderId: orderId } : {}), note }, overrideAccess: true }).catch(() => {})
    return Response.json({ error: 'Order needs review. Check Orders in Payload and Odoo before placing it again.', reference }, { status: 503 })
  }
}
