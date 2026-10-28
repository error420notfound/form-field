import 'dotenv/config'
import { getPayload } from 'payload'
if (process.env.NODE_ENV !== 'development') throw new Error('Odoo sync is limited to local development.')
process.env.COMMERCE_SCHEMA_MANAGED='1'
const {default:config}=await import('../payload.config')
const {refreshOdoo}=await import('./odoo-sync')
const payload=await getPayload({config})
try { const result=await refreshOdoo(payload); console.log(`Odoo refresh: ${result.updated} updated, ${result.failed} failed.`); if(result.failed) process.exitCode=1 } finally {await payload.destroy()}
