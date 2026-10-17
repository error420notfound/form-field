import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildConfig,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import sharp from 'sharp'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const admin = ({ req }: { req: PayloadRequest }) =>
  req.user?.collection === 'users'
const writable = { create: admin, update: admin, delete: admin }
const publicRead = () => true
const products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  versions: { drafts: true },
  access: {
    ...writable,
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    readVersions: admin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      validate: (value: unknown) =>
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
  admin: { user: 'users', importMap: { baseDir: root } },
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
      slug: 'media',
      access: { ...writable, read: publicRead },
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
