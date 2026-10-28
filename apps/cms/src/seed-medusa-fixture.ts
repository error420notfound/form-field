import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from './payload.config'
import { medusaFixtureSlug } from './medusa-fixture'

if (process.env.NODE_ENV === 'production') throw new Error('Development fixtures are disabled in production.')
const fixture = JSON.parse(readFileSync(path.resolve(process.cwd(), '../../.local/medusa-fixture.json'), 'utf8')) as { productId: string }
if (!/^prod_[\w-]{1,100}$/.test(fixture.productId)) throw new Error('Invalid Medusa fixture ID.')
const payload = await getPayload({ config })
try {
  const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: medusaFixtureSlug } }, limit: 1 })
  if (docs.length) {
    if (!docs[0].demo || docs[0].medusaProductId !== fixture.productId) throw new Error('Existing fixture association differs. Repair it explicitly in Payload Admin.')
    console.log('Existing editorial fixture preserved.')
  } else {
    await payload.create({ collection: 'products', data: {
      name: 'Development commerce fixture', slug: medusaFixtureSlug,
      shortDescription: 'Disposable local integration test. Not an actual form+field product.',
      description: 'Editorial fixture supplied by Payload. Medusa supplies the synthetic configurations, INR prices, inventory and cart totals. No product claims or photography are implied.',
      medusaProductId: fixture.productId, demo: true, reviewOnly: false, purchaseEligible: true,
      availability: 'available', currency: 'INR', price: null, _status: 'published',
    } })
    console.log('Created labeled editorial fixture. Existing products and media preserved.')
  }
} finally { await payload.destroy() }
