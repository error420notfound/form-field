import { readFileSync, writeFileSync, chmodSync } from 'node:fs'
const config = JSON.parse(readFileSync('.local/commerce-public.json', 'utf8'))
const file = 'apps/storefront/.env'
let contents = readFileSync(file, 'utf8')
for (const [key, value] of Object.entries({ PUBLIC_MEDUSA_BACKEND_URL: config.backendUrl, PUBLIC_MEDUSA_PUBLISHABLE_KEY: config.publishableKey, MEDUSA_REGION_ID: config.regionId })) {
  if (typeof value !== 'string' || !value || /[\r\n]/.test(value)) throw new Error(`Invalid ${key}`)
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  contents = pattern.test(contents) ? contents.replace(pattern, line) : `${contents.trimEnd()}\n${line}\n`
}
writeFileSync(file, contents, { mode: 0o600 })
chmodSync(file, 0o600)
console.log('Storefront public Medusa URL/key and server-side INR region configured. Restart Astro.')
