import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const objects = [
  ['pourframe-review', 'pourframe'],
  ['lighting-review', 'lighting'],
  ['macro-keypad-review', 'keypad'],
  ['thermal-printer-review', 'printer'],
]
try {
  for (const [slug, key] of objects) {
    const product = (
      await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
      })
    ).docs[0]
    if (!product?.reviewOnly || product.gallery?.length) continue
    const filename = `${key}-review.webp`
    let asset = (
      await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
      })
    ).docs[0]
    if (!asset) {
      const data = await fs.readFile(
        path.resolve('../storefront/public/images', `${key}.webp`),
      )
      asset = await payload.create({
        collection: 'media',
        data: {
          alt: `Illustrative concept for ${product.name}; not an actual product design`,
          caption: 'Illustrative placeholder. Final design is not confirmed.',
          placeholder: true,
          sourcePage: 'docs/design/asset-provenance.json',
          author: 'OpenAI Image Gen',
          licenceURL: 'https://openai.com/policies/terms-of-use/',
          downloadDate: '2026-10-22T00:00:00.000Z',
          attribution: 'Illustrative placeholder',
          role: 'Local review category concept',
          mobileFocalX: 75,
          mobileFocalY: 50,
        },
        file: {
          data,
          mimetype: 'image/webp',
          name: filename,
          size: data.length,
        },
      })
    }
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { gallery: [asset.id] },
    })
    payload.logger.info(`Attached review media to ${product.name}`)
  }
} finally {
  await payload.destroy()
}
