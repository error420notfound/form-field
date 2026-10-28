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
import { medusaFixtureSlug } from './medusa-fixture'
import { staff, owner, editor, operator, draftOnly, canEdit } from './access'
import { websitePages } from './website/pages'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const admin = staff
const writable = { create: owner, update: owner, delete: owner }
const editorial = { create: editor, update: editor, delete: owner }
const publicRead = () => true
const products: CollectionConfig = {
  slug: 'products',
  admin: { group: 'Website', components: { edit: { beforeDocumentControls: ['./src/website/ProductCommerce#default'] } }, useAsTitle: 'name', defaultColumns: ['name', 'slug', '_status', 'updatedAt'], description: 'Editorial content is managed here. Linked Medusa products use Medusa commerce; existing unlinked products retain the legacy Odoo flow.', preview: (doc) => doc.slug ? `${process.env.STOREFRONT_ORIGIN || 'http://localhost:4321'}/products/${encodeURIComponent(String(doc.slug))}?preview=1` : null },
  versions: { drafts: true },
  hooks: {
    beforeChange: [draftOnly],
    afterRead: [async ({ doc }) => {
      // Never overlay legacy prices or contact Odoo for a Medusa-linked story.
      if (doc.medusaProductId) { doc.price = null; return doc }
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
    ...editorial,
    read: ({ req }) => (canEdit(req.user) ? true : process.env.NODE_ENV === 'production'
      ? { _status: { equals: 'published' }, slug: { not_in: [...localAppleDemoSlugs, medusaFixtureSlug] } } as Where
      : { _status: { equals: 'published' } }),
    readVersions: editor,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'medusaProductId', type: 'text', unique: true, index: true,
      admin: { description: 'Stable prod_… ID from Medusa Admin. Linking selects Medusa commerce and its separate bag. Clear this field to restore the legacy path; existing cart selections are never migrated.' },
      hooks: { beforeValidate: [({ value }) => typeof value === 'string' ? value.trim() || null : value] },
      validate: (value: unknown) => value == null || (typeof value === 'string' && /^prod_[\w-]{1,100}$/.test(value)) || 'Enter a Medusa product ID beginning with prod_.',
    },
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
      access: {
        create: ({ data }) => !data?.medusaProductId,
        update: ({ data, doc }) => !data?.medusaProductId && !doc?.medusaProductId,
      },
      admin: { description: 'Legacy price in paise. Medusa-linked products ignore this value; manage their prices in Medusa Admin.', condition: (data) => !data?.medusaProductId },
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
    components: { beforeDashboard: ['./src/commerce/Dashboard#default'], graphics: { Logo: './src/website/Brand#Logo', Icon: './src/website/Brand#Icon' } },
    meta: { titleSuffix: ' · form+field' },
    user: 'users',
    importMap: {
      baseDir: root,
      importMapFile: path.join(root, 'src/app/(payload)/admin/importMap.ts'),
    },
  },
  db: sqliteAdapter({
    ...(process.env.COMMERCE_SCHEMA_MANAGED === '1' ? { push: false } : {}),
    client: { url: process.env.DATABASE_URL || 'file:./data/store.db' },
  }),
  sharp,
  typescript: { outputFile: path.join(root, 'src/payload-types.ts') },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { group: 'Settings' },
      access: { ...writable, read: owner, admin: staff, unlock: owner },
      fields: [{ name: 'role', type: 'select', required: true, defaultValue: ({ user }) => user ? 'editor' : 'owner', options: ['owner', 'editor', 'operations'], access: { create: owner, update: owner } }],
    },
    {
      slug: 'customers',
      auth: { tokenExpiration: 60 * 60 * 24, maxLoginAttempts: 5, lockTime: 600000 },
      admin: { group: 'Commerce', useAsTitle: 'email', defaultColumns: ['email', 'name', 'odooSyncStatus'] },
      access: { ...writable, read: operator, admin: operator },
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
      admin: { group: 'Website' },
      access: { create: editor, update: owner, delete: owner, read: ({ req }) => req.user || process.env.NODE_ENV !== 'production' ? true : { or: [{ role: { exists: false } }, { role: { not_equals: 'local-homeview-demo' } }] } },
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
      admin: { group: 'Website', useAsTitle: 'name' },
      access: { ...writable, read: publicRead },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    products,
    websitePages,
    {
      slug: 'inventory-snapshots',
      admin: { group: 'Commerce', useAsTitle: 'name', defaultColumns: ['name', 'source', 'quantity', 'updatedAt'] },
      access: { create: () => false, update: () => false, delete: () => false, read: operator },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'productId', type: 'number', admin: { readOnly: true } },
        { name: 'source', type: 'select', required: true, options: ['demo', 'odoo'], admin: { readOnly: true } },
        { name: 'demoSeed', type: 'text', index: true, access: { create: () => false, update: () => false }, admin: { readOnly: true } },
        { name: 'quantity', type: 'number', required: true, admin: { readOnly: true } },
        { name: 'price', type: 'number', admin: { readOnly: true, description: 'Price in paise.' } },
        { name: 'observedAt', type: 'date', required: true, admin: { readOnly: true } },
        { name: 'syncError', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      slug: 'orders',
      admin: { group: 'Commerce', useAsTitle: 'reference', defaultColumns: ['reference', 'status', 'paymentStatus', 'odooReference', 'createdAt'] },
      access: { create: () => false, update: () => false, delete: () => false, read: operator },
      fields: [
        { name: 'reference', type: 'text', required: true, unique: true, index: true },
        { name: 'demoSeed', type: 'text', index: true, access: { create: () => false, update: () => false }, admin: { readOnly: true, description: 'Identifies isolated local dashboard sample records.' } },
        { name: 'operations', type: 'json', access: { create: () => false, update: () => false }, admin: { readOnly: true, description: 'Order operation snapshots and event history. Live fulfilment is owned by Odoo.' } },
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
      admin: { group: 'Settings' },
      access: { read: publicRead, update: owner },
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
