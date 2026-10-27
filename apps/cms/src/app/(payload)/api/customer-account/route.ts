import config from '@payload-config'
import { getPayload } from 'payload'
import { customerFromHeaders, odooCall, readProfile, syncCustomer } from '../../../../customer-service'

const reply = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const safe = (customer: any) => ({ id: customer.id, email: customer.email, name: customer.name, address: customer.address || '', apartment: customer.apartment || '', city: customer.city || '', postalCode: customer.postalCode || '', state: customer.state || '', country: customer.country || '', odooSyncStatus: customer.odooSyncStatus })
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return reply({ error: 'Customer accounts are available only in local development.' }, 403)
  const payload = await getPayload({ config })
  let body: any
  try { body = await request.json() } catch { return reply({ error: 'Invalid request.' }, 400) }
  if (body?.action === 'signup' || body?.action === 'login') {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = body.password
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || typeof password !== 'string' || password.length < 10 || password.length > 128) return reply({ error: 'Enter a valid email and a password of 10–128 characters.' }, 400)
    try {
      if (body.action === 'signup') {
        const profile = readProfile(body.profile)
        await payload.create({ collection: 'customers', data: { email, password, ...profile, odooSyncStatus: 'pending' }, overrideAccess: true })
      }
      const result = await payload.login({ collection: 'customers', data: { email, password }, overrideAccess: true })
      if (!result.token || !result.user) throw new Error('Login failed')
      try { await syncCustomer(payload, result.user) } catch { /* Retry on next login, profile save or checkout. */ }
      const updated = await payload.findByID({ collection: 'customers', id: result.user.id, overrideAccess: true })
      return reply({ token: result.token, customer: safe(updated) })
    } catch { return reply({ error: body.action === 'signup' ? 'Could not create account. Check your details or sign in.' : 'Could not sign in. Check your email and password.' }, 400) }
  }
  const customer = await customerFromHeaders(payload, request.headers)
  if (!customer) return reply({ error: 'Please sign in.' }, 401)
  if (body?.action === 'profile') {
    try {
      const profile = readProfile(body.profile)
      const updated = await payload.update({ collection: 'customers', id: customer.id, data: { ...profile, odooSyncStatus: 'pending' }, overrideAccess: true })
      try { await syncCustomer(payload, updated) } catch { /* profile is retained for retry */ }
      return reply({ customer: safe(await payload.findByID({ collection: 'customers', id: customer.id, overrideAccess: true })) })
    } catch { return reply({ error: 'Could not save the profile. Check your details.' }, 400) }
  }
  return reply({ error: 'Invalid request.' }, 400)
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return reply({ error: 'Not available.' }, 403)
  const payload = await getPayload({ config })
  const customer = await customerFromHeaders(payload, request.headers)
  if (!customer) return reply({ error: 'Please sign in.' }, 401)
  const result = await payload.find({ collection: 'orders', where: { account: { equals: customer.id } }, sort: '-createdAt', limit: 100, depth: 0, overrideAccess: true })
  const orders = await Promise.all(result.docs.map(async order => {
    let delivery = 'Unavailable'
    if (order.odooOrderId) try {
      const sales = await odooCall('sale.order', 'read', { ids: [order.odooOrderId], fields: ['state', 'picking_ids'] })
      const sale = sales[0]
      if (sale?.state === 'cancel') delivery = 'Cancelled'
      else if (sale?.picking_ids?.length) {
        const picks = await odooCall('stock.picking', 'read', { ids: sale.picking_ids, fields: ['state'] })
        if (picks.length && picks.every((p: any) => p.state === 'done')) delivery = 'Delivered'
        else if (picks.some((p: any) => p.state === 'assigned')) delivery = 'Preparing for delivery'
        else delivery = 'Awaiting stock or processing'
      } else delivery = 'Not yet scheduled'
    } catch { /* retain saved order when Odoo is unavailable */ }
    return { reference: order.reference, odooReference: order.odooReference, status: order.status, paymentStatus: order.paymentStatus, items: order.items, subtotal: order.subtotal, createdAt: order.createdAt, delivery }
  }))
  return reply({ customer: safe(customer), orders })
}
