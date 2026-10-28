import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('apps/commerce', { recursive: true })
mkdirSync('.local', { recursive: true })
const secret = () => randomBytes(48).toString('hex')
if (!existsSync('.local/postgres.env')) {
  writeFileSync('.local/postgres.env', `PG_LOCAL_PASSWORD=${secret()}\n`, { mode: 0o600 })
}
process.loadEnvFile('.local/postgres.env')
if (!existsSync('apps/commerce/.env')) {
  writeFileSync('apps/commerce/.env', [
    `DATABASE_URL=postgres://formfield_medusa:${secret()}@127.0.0.1:5433/formfield_medusa`,
    'MEDUSA_BACKEND_URL=http://localhost:9000',
    'STORE_CORS=http://localhost:4321',
    'ADMIN_CORS=http://localhost:9000',
    'AUTH_CORS=http://localhost:4321,http://localhost:9000',
    `JWT_SECRET=${secret()}`, `COOKIE_SECRET=${secret()}`, '',
  ].join('\n'), { mode: 0o600 })
}
console.log('Commerce environment prepared. Existing files preserved; secrets were not printed.')
