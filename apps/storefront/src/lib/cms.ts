import { isLocalAppleDemo } from '../../../cms/src/local-apple-demo'
import type {
  Product,
  Media,
  Category,
  StoreSetting,
} from '../../../cms/src/payload-types'
export type { Product, Media, Category, StoreSetting }
const base = (
  import.meta.env.CMS_URL ||
  process.env.CMS_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')
export class CMSUnavailable extends Error {
  constructor() {
    super(
      'Cannot connect to the CMS. Start it with npm run dev:cms, check CMS_URL, then refresh.',
    )
  }
}
export async function request<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${base}/api/${path}`, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`CMS HTTP ${response.status}`)
    return (await response.json()) as T
  } catch {
    throw new CMSUnavailable()
  }
}
export const settings = () => request<StoreSetting>('globals/store-settings')
export type Stock = { linked: false } | { linked: true; available: boolean; quantity: number; id: number; price: number; options: { attribute: string; value: string }[] } | { error: true }
export async function stock(id: number, variantId?: number): Promise<Stock> {
  try {
    const response = await fetch(`${base}/api/stock?id=${id}${variantId ? `&variant=${variantId}` : ''}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' })
    if (!response.ok) return { error: true }
    return await response.json() as Stock
  } catch {
    return { error: true }
  }
}
export const categories = () =>
  request<{ docs: Category[] }>('categories?limit=100&sort=name')
export async function products(query = '') {
  return (
    await request<{ docs: Product[] }>(
      `products?depth=1&limit=100&sort=name&where[_status][equals]=published${query}`,
    )
  ).docs.filter((p) => import.meta.env.DEV || !isLocalAppleDemo(p.slug))
}
export async function product(slug: string) {
  return (await products(`&where[slug][equals]=${encodeURIComponent(slug)}`))[0]
}
export function media(value: number | Media | null | undefined) {
  return value && typeof value === 'object' ? value : null
}
export function mediaURL(url: string | null | undefined) {
  return url ? new URL(url, `${base}/`).href : ''
}
/** Serve CMS-hosted image files through the storefront origin on the homepage. */
export function homepageMediaURL(url: string | null | undefined) {
  if (!url) return ''
  const parsed = new URL(url, `${base}/`)
  const prefix = '/api/media/file/'
  if (parsed.pathname.startsWith(prefix)) {
    const filename = parsed.pathname.slice(prefix.length)
    if (filename && !filename.includes('/')) return `/api/homepage-media/${filename}`
  }
  return parsed.href
}
export function image(product: Product, variantId?: number) {
  const variant = product.variantImages?.find(item => item.odooVariantId === variantId)
  const m = media(variant?.image) || media(product.gallery?.[0])
  return {
    url: mediaURL(m?.sizes?.card?.url || m?.url),
    alt: m?.alt || product.name,
  }
}
export const price = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value / 100)
export const availability = (value: Product['availability']) =>
  ({
    available: 'Available',
    'coming-soon': 'Coming soon',
    unavailable: 'Unavailable',
  })[value]
