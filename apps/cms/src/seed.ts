import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import sharp from 'sharp'
const payload = await getPayload({ config })
const demos = [
  {
    slug: 'arc-tray-demo',
    name: 'Arc tray',
    category: 'Desk objects',
    price: 180000,
    color: '#ae694e',
    shape:
      '<ellipse cx="400" cy="420" rx="235" ry="95" fill="#683f30"/><ellipse cx="400" cy="400" rx="235" ry="95" fill="#ae694e"/><ellipse cx="400" cy="399" rx="195" ry="65" fill="#bd7b5c"/>',
    availability: 'available' as const,
  },
  {
    slug: 'fold-bookend-demo',
    name: 'Fold bookend',
    category: 'Desk objects',
    price: 240000,
    color: '#555f51',
    shape:
      '<path d="M245 460 L430 525 L585 435 L400 375 Z" fill="#555f51"/><path d="M400 375 L400 200 L585 260 L585 435 Z" fill="#79826c"/><path d="M400 375 L400 200 L390 205 L390 380 Z" fill="#414a3c"/>',
    availability: 'available' as const,
  },
  {
    slug: 'still-vessel-demo',
    name: 'Still vessel',
    category: 'Living objects',
    price: 320000,
    color: '#d6bd97',
    shape:
      '<path d="M300 310 Q275 480 335 520 Q400 550 465 520 Q525 480 500 310 Z" fill="#c3a67d"/><ellipse cx="400" cy="310" rx="100" ry="40" fill="#e2cfaf"/><ellipse cx="400" cy="310" rx="78" ry="24" fill="#91775a"/>',
    availability: 'coming-soon' as const,
  },
]
try {
  for (const demo of demos) {
    if (
      (
        await payload.find({
          collection: 'products',
          where: { slug: { equals: demo.slug } },
          limit: 1,
        })
      ).docs.length
    )
      continue
    const categorySlug = demo.category.toLowerCase().replaceAll(' ', '-')
    let category = (
      await payload.find({
        collection: 'categories',
        where: { slug: { equals: categorySlug } },
        limit: 1,
      })
    ).docs[0]
    if (!category)
      category = await payload.create({
        collection: 'categories',
        data: { name: demo.category, slug: categorySlug },
      })
    const filename = `${demo.slug}.png`
    let media = (
      await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
      })
    ).docs[0]
    if (!media) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900"><rect width="800" height="900" fill="#e9e4da"/><ellipse cx="400" cy="565" rx="220" ry="24" fill="#d6cfc1"/>${demo.shape}<text x="40" y="845" font-family="sans-serif" font-size="18" fill="#5c584f">DEMONSTRATION OBJECT / ${demo.name.toUpperCase()}</text></svg>`
      const data = await sharp(Buffer.from(svg)).png().toBuffer()
      media = await payload.create({
        collection: 'media',
        data: {
          alt: `Authored illustration of the fictional ${demo.name.toLowerCase()}`,
          caption: 'Fictional demonstration illustration.',
        },
        file: {
          data,
          mimetype: 'image/png',
          name: filename,
          size: data.length,
        },
      })
    }
    await payload.create({
      collection: 'products',
      data: {
        name: demo.name,
        slug: demo.slug,
        shortDescription:
          'A fictional demonstration object for exploring this store.',
        description:
          'Demonstration content only. This imagined object illustrates how purpose, proportions, and details can be presented alongside familiar shopping controls. Replace this content with your own product design.',
        price: demo.price,
        currency: 'INR',
        availability: demo.availability,
        categories: [category.id],
        gallery: [media.id],
        featured: true,
        demo: true,
        _status: 'published',
        materials:
          'Illustrative material specification — replace before selling.',
        dimensions: 'Demonstration dimensions — to be confirmed.',
        care: 'Add verified care instructions for your finished product.',
        included: 'One fictional demonstration object.',
        features: [
          {
            title: 'Designed for context',
            description:
              'Use this space to explain a real design decision and how it helps someone use the product.',
          },
        ],
      },
    })
  }
  const settings = await payload.findGlobal({ slug: 'store-settings' })
  if (!settings.storeName)
    await payload.updateGlobal({
      slug: 'store-settings',
      data: {
        storeName: 'Form & Field',
        introduction: 'Objects, considered.',
        contactEmail: 'studio@example.test',
        homeHeading: 'Thoughtful objects. Everyday use.',
        homeText:
          'An independent design studio exploring the relationship between purpose, material, and the spaces we inhabit.',
      },
    })
  console.log(
    'Demonstration content ready. Existing products and settings preserved.',
  )
} finally {
  await payload.destroy()
}
