import Medusa from '@medusajs/js-sdk'

/** Server-side Store API only. Never add an admin API key or customer token here. */
export function commerceClient() {
  const baseUrl = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL || process.env.PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = import.meta.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY || process.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!baseUrl || !publishableKey) throw new Error('Commerce is not configured.')
  return new Medusa({ baseUrl, publishableKey, debug: false, auth: { type: 'jwt', jwtTokenStorageMethod: 'nostore' } })
}
export function commerceRegionId() {
  const id = import.meta.env.MEDUSA_REGION_ID || process.env.MEDUSA_REGION_ID
  if (!id) throw new Error('Commerce region is not configured.')
  return id
}
export function statusOf(error: unknown): number | undefined {
  return error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' ? error.status : undefined
}
