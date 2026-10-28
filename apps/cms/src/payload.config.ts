import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildConfig,
  type CollectionConfig,
  type PayloadRequest,
  type Where,
} from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import sharp from 'sharp'
import { linkedOdooProduct } from './odoo-product'
import { localAppleDemoSlugs } from './local-apple-demo'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const admin = ({ req }: { req: PayloadRequest }) =>
  req.user?.collection === 'users'
const writable = { create: admin, update: admin, delete: admin }
const publicRead = () => true
const products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  versions: { drafts: true },
  hooks: {
    afterRead: [async ({ doc }) => {
      try {
        const odoo = await linkedOdooProduct(doc.id)
        if (odoo) doc.price = odoo.price
      } catch (error) {
        console.error('Could not load Odoo product price:', error instanceof Error ? error.message : 'Unknown error')
        doc.price = null
      }
      return doc
    }],
  },
  access: {
    ...writable,
    read: ({ req }) => (req.user ? true : process.env.NODE_ENV === 'production'
      ? { _status: { equals: 'published' }, slug: { not_in: [...localAppleDemoSlugs] } } as Where
      : { _status: { equals: 'published' } }),
    readVersions: admin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'descriptor', type: 'text' },
    { name: 'editorialOrder', type: 'number', defaultValue: 100 },
    {
      name: 'homepageSize',
      type: 'select',
      defaultValue: 'paired',
      options: ['broad', 'paired'],
    },
    {
      name: 'homepageTextPlacement',
      label: 'Homepage paired tile text placement',
      type: 'select',
      defaultValue: 'above',
      options: [
        { label: 'Above image', value: 'above' },
        { label: 'Below image', value: 'below' },
        { label: 'Title above, caption below', value: 'split' },
      ],
    },
    {
      name: 'themeId',
      type: 'select',
      defaultValue: 'neutral',
      options: ['neutral', 'blue', 'yellow'],
    },
    { name: 'purchaseEligible', type: 'checkbox', defaultValue: true },
    { name: 'reviewOnly', type: 'checkbox', defaultValue: false },
    {
      name: 'relatedObjects',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 2,
    },
    {
      name: 'upsellProducts',
      label: 'Upsell products',
      admin: { description: 'Ordered recommendations shown after adding this product and in the bag.' },
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'story',
      type: 'array',
      fields: [
        { name: 'chapterId', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'copy', type: 'textarea', required: true },
        { name: 'media', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'pdpSections',
      type: 'array',
      fields: [
        { name: 'sectionId', type: 'text', required: true },
        { name: 'variant', type: 'select', required: true, options: ['wide', 'split', 'paired', 'detail'] },
        { name: 'textAlignment', label: 'Text alignment', type: 'select', defaultValue: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        { name: 'label', type: 'text' },
        { name: 'heading', type: 'text', required: true },
        { name: 'copy', type: 'textarea' },
        { name: 'media', type: 'upload', relationTo: 'media' },
        { name: 'caption', type: 'text' },
        { name: 'cards', type: 'array', fields: [
          { name: 'heading', type: 'text', required: true },
          { name: 'copy', type: 'textarea' },
          { name: 'media', type: 'upload', relationTo: 'media' },
        ] },
        { name: 'callouts', type: 'array', fields: [
          { name: 'heading', type: 'text', required: true },
          { name: 'copy', type: 'textarea' },
        ] },
        { name: 'modalLabel', type: 'text' },
        { name: 'modalCopy', type: 'textarea' },
      ],
    },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'variantImages', type: 'array', admin: { description: 'Optional product images keyed by Odoo variant ID.' }, fields: [
      { name: 'odooVariantId', type: 'number', required: true, min: 1 },
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
    ] },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'price',
      type: 'number',
      admin: { description: 'For linked products, the displayed price comes from Odoo. Edit it in Odoo.' },
      required: process.env.FORM_FIELD_ADDITIVE_SCHEMA === '1',
      min: 0,
      validate: (value: unknown) =>
        value == null ||
        (Number.isSafeInteger(value) && Number(value) >= 0) ||
        'Enter a non-negative integer in paise.',
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'INR',
      options: ['INR'],
    },
    {
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Coming soon', value: 'coming-soon' },
        { label: 'Unavailable', value: 'unavailable' },
      ],
    },
    ...['materials', 'dimensions', 'care', 'included'].map((name) => ({
      name,
      type: 'textarea' as const,
    })),
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'demo',
      label: 'Demonstration content',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.CMS_URL || 'http://localhost:3000',
  cors: [process.env.STOREFRONT_ORIGIN || 'http://localhost:4321'],
  csrf: [process.env.CMS_URL || 'http://localhost:3000'],
  admin: {
    user: 'users',
    importMap: {
      baseDir: root,
      importMapFile: path.join(root, 'src/app/(payload)/admin/importMap.ts'),
    },
  },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./data/store.db' },
  }),
  sharp,
  typescript: { outputFile: path.join(root, 'src/payload-types.ts') },
  collections: [
    {
      slug: 'users',
      auth: true,
      access: { ...writable, read: admin, admin, unlock: admin },
      fields: [],
    },
    {
      slug: 'customers',
      auth: { tokenExpiration: 60 * 60 * 24, maxLoginAttempts: 5, lockTime: 600000 },
      admin: { useAsTitle: 'email', defaultColumns: ['email', 'name', 'odooSyncStatus'] },
      access: { ...writable, read: admin, admin },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'address', type: 'text' },
        { name: 'apartment', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'odooCustomerId', type: 'number', admin: { readOnly: true } },
        { name: 'odooSyncStatus', type: 'select', defaultValue: 'pending', options: ['pending', 'synced'], admin: { readOnly: true } },
      ],
    },
    {
      slug: 'media',
      access: { ...writable, read: ({ req }) => req.user || process.env.NODE_ENV !== 'production' ? true : { or: [{ role: { exists: false } }, { role: { not_equals: 'local-homeview-demo' } }] } },
      upload: {
        staticDir: path.join(root, 'uploads'),
        mimeTypes: ['image/*'],
        imageSizes: [
          { name: 'card', width: 640, height: 720, fit: 'inside' },
          { name: 'gallery', width: 1600, height: 1800, fit: 'inside' },
        ],
      },
      fields: [
        { name: 'alt', type: 'text', required: true },
        { name: 'caption', type: 'textarea' },
        { name: 'placeholder', type: 'checkbox', defaultValue: false },
        { name: 'sourcePage', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'licenceURL', type: 'text' },
        { name: 'downloadDate', type: 'date' },
        { name: 'attribution', type: 'text' },
        { name: 'role', type: 'text' },
        {
          name: 'mobileFocalX',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 50,
        },
        {
          name: 'mobileFocalY',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 50,
        },
      ],
    },
    {
      slug: 'categories',
      admin: { useAsTitle: 'name' },
      access: { ...writable, read: publicRead },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    products,
    {
      slug: 'orders',
      admin: { useAsTitle: 'reference', defaultColumns: ['reference', 'status', 'paymentStatus', 'odooReference', 'createdAt'] },
      access: { ...writable, read: admin },
      fields: [
        { name: 'reference', type: 'text', required: true, unique: true, index: true },
        { name: 'account', type: 'relationship', relationTo: 'customers', index: true, admin: { description: 'Empty for older guest orders.' } },
        { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: ['pending', 'confirmed', 'review'] },
        { name: 'customer', type: 'json', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'number', required: true },
        { name: 'paymentMethod', type: 'select', options: [{ label: 'Demo payment (simulated)', value: 'demo' }], admin: { description: 'Local simulation only; no payment is collected.' } },
        { name: 'paymentStatus', type: 'select', options: [{ label: 'Simulation pending', value: 'pending' }, { label: 'Simulated successful', value: 'simulated-success' }], admin: { description: 'A simulated result, not a real payment.' } },
        { name: 'odooOrderId', type: 'number' },
        { name: 'odooCustomerId', type: 'number', admin: { description: 'Odoo customer holding this order and its purchase history.' } },
        { name: 'odooReference', type: 'text' },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
  globals: [
    {
      slug: 'store-settings',
      access: { read: publicRead, update: admin },
      fields: [
        { name: 'storeName', type: 'text', required: true },
        { name: 'introduction', type: 'textarea' },
        { name: 'contactEmail', type: 'email' },
        { name: 'homeHeading', type: 'text' },
        { name: 'homeText', type: 'textarea' },
      ],
    },
  ],
})
