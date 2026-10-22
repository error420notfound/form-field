import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const objects = [
  {
    slug: 'pourframe-review',
    name: 'PourFrame',
    descriptor: 'Coffee tool',
    themeId: 'neutral' as const,
    heading: 'A familiar ritual, reconsidered.',
    copy: 'PourFrame is part of the developing collection. The coffee-tool category is confirmed; its form, operation and specifications are not. The image is an illustrative placeholder.',
  },
  {
    slug: 'lighting-review',
    name: 'Lighting',
    descriptor: 'Light for daily life',
    themeId: 'blue' as const,
    heading: 'Where the evening settles.',
    copy: 'Lighting is one of the categories being explored. The working name and pictured object are placeholders. Light distribution, materials and dimensions remain to be confirmed.',
  },
  {
    slug: 'macro-keypad-review',
    name: 'Macro keypad',
    descriptor: 'Input object',
    themeId: 'yellow' as const,
    heading: 'Some actions deserve a key of their own.',
    copy: 'A draft observation for a macro keypad story. The final design, key layout, connectivity and control mapping have not been supplied. The image is illustrative and does not establish these details.',
  },
  {
    slug: 'thermal-printer-review',
    name: 'Thermal printer',
    descriptor: 'Print object',
    themeId: 'blue' as const,
    heading: 'A thought can leave the screen.',
    copy: 'A draft editorial direction for a thermal printer. Printing specifications, compatibility and the final design remain unconfirmed. The image is an illustrative placeholder.',
  },
]
try {
  for (const [i, object] of objects.entries()) {
    if (
      (
        await payload.find({
          collection: 'products',
          where: { slug: { equals: object.slug } },
          limit: 1,
        })
      ).docs.length
    )
      continue
    await payload.create({
      collection: 'products',
      data: {
        name: object.name,
        slug: object.slug,
        descriptor: object.descriptor,
        themeId: object.themeId,
        shortDescription: `An evolving ${object.descriptor.toLowerCase()} concept. Product details are being developed.`,
        description: object.copy,
        price: null,
        currency: 'INR',
        availability: 'coming-soon',
        purchaseEligible: false,
        reviewOnly: true,
        demo: true,
        featured: true,
        editorialOrder: i,
        homepageSize: i < 2 ? 'broad' : 'paired',
        story: [
          {
            chapterId: 'observation',
            heading: object.heading,
            copy: object.copy,
          },
        ],
        _status: 'published',
      },
    })
    payload.logger.info(`Created local review object: ${object.name}`)
  }
} finally {
  await payload.destroy()
}
