import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
for (const dir of ['apps/cms/data', 'apps/cms/uploads'])
  mkdirSync(dir, { recursive: true })
for (const [file, contents] of [
  [
    'apps/cms/.env',
    `PAYLOAD_SECRET=${randomBytes(48).toString('hex')}\nDATABASE_URL=file:./data/store.db\nSTOREFRONT_ORIGIN=http://localhost:4321\nCMS_URL=http://localhost:3000\n`,
  ],
  ['apps/storefront/.env', 'CMS_URL=http://localhost:3000\n'],
])
  if (!existsSync(file)) writeFileSync(file, contents, { mode: 0o600 })
console.log(
  'Local directories and missing environment files prepared. Existing files preserved.',
)
