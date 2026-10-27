import 'dotenv/config'

// Read-only connection check. Run from apps/cms so dotenv loads its local .env.
const base = (process.env.ODOO_URL || 'http://localhost:8069').replace(/\/$/, '')
const database = process.env.ODOO_DATABASE
const key = process.env.ODOO_API_KEY

if (!database || !key) {
  console.error('Set ODOO_DATABASE and ODOO_API_KEY in apps/cms/.env first.')
  process.exitCode = 1
} else {
  try {
    const url = new URL(base)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.protocol !== 'http:') {
      throw new Error('This local check only accepts an HTTP loopback Odoo URL.')
    }
    const response = await fetch(`${base}/json/2/stock.warehouse/search_read`, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${key}`,
        'Content-Type': 'application/json',
        'X-Odoo-Database': database,
      },
      body: JSON.stringify({ domain: [], fields: ['id', 'name', 'code'], limit: 50 }),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`Odoo returned HTTP ${response.status}. Check the key and inventory permissions.`)
    const warehouses = await response.json()
    if (!Array.isArray(warehouses)) throw new Error('Odoo returned an unexpected response.')
    console.log('Connected to Odoo. Warehouses visible to the integration user:')
    for (const warehouse of warehouses) console.log(`  ${warehouse.id}: ${warehouse.name} (${warehouse.code})`)
    if (!warehouses.length) console.log('  None. Check Inventory setup and user permissions.')
  } catch (error) {
    console.error(`Connection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exitCode = 1
  }
}
