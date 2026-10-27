import type { Payload } from 'payload'
import type { Customer } from './payload-types'

export async function odooCall(model: string, method: string, body: object): Promise<any> {
  const base = process.env.ODOO_URL || ''
  const url = new URL(base)
  if (process.env.NODE_ENV !== 'development' || url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !process.env.ODOO_API_KEY || !process.env.ODOO_DATABASE) throw new Error('Local Odoo unavailable')
  const response = await fetch(`${base.replace(/\/$/, '')}/json/2/${model}/${method}`, { method: 'POST', headers: { Authorization: `bearer ${process.env.ODOO_API_KEY}`, 'X-Odoo-Database': process.env.ODOO_DATABASE, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000), cache: 'no-store' })
  if (!response.ok) throw new Error('Odoo request failed')
  return response.json()
}

export async function customerFromHeaders(payload: Payload, headers: Headers): Promise<Customer | null> {
  const { user } = await payload.auth({ headers })
  return user?.collection === 'customers' ? user as Customer : null
}

const locks = new Map<number, Promise<number>>()
export async function syncCustomer(payload: Payload, customer: Customer): Promise<number> {
  const id = Number(customer.id)
  const existing = locks.get(id)
  if (existing) return existing
  const pending = (async () => {
    const current = await payload.findByID({ collection: 'customers', id, overrideAccess: true })
    const ref = `form-field-account-${id}`
    const vals = { name: current.name, email: current.email, street: current.address || '', street2: current.apartment || '', city: current.city || '', zip: current.postalCode || '', comment: `State: ${current.state || ''}\nCountry: ${current.country || ''}`, customer_rank: 1 }
    let partnerId = current.odooCustomerId || 0
    if (!partnerId) {
      const matches = await odooCall('res.partner', 'search_read', { domain: [['ref', '=', ref]], fields: ['id'], limit: 2 })
      if (matches.length > 1) throw new Error('Ambiguous Odoo account reference')
      if (matches.length === 1) partnerId = matches[0].id
      else {
        const ids = await odooCall('res.partner', 'create', { vals_list: [{ ...vals, ref }] })
        partnerId = ids[0]
      }
      if (!Number.isSafeInteger(partnerId) || partnerId < 1) throw new Error('Invalid Odoo customer')
      await payload.update({ collection: 'customers', id, data: { odooCustomerId: partnerId }, overrideAccess: true })
    }
    await odooCall('res.partner', 'write', { ids: [partnerId], vals })
    await payload.update({ collection: 'customers', id, data: { odooSyncStatus: 'synced' }, overrideAccess: true })
    return partnerId
  })()
  locks.set(id, pending)
  try { return await pending } finally { locks.delete(id) }
}

export const profileFields = ['name', 'address', 'apartment', 'city', 'postalCode', 'state', 'country'] as const
export function readProfile(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Invalid profile')
  const input = value as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const key of profileFields) {
    const v = input[key] ?? ''
    if (typeof v !== 'string' || v.length > 200) throw new Error('Invalid profile')
    result[key] = v.trim()
  }
  if (!result.name) throw new Error('Name is required')
  return result as Record<typeof profileFields[number], string>
}
