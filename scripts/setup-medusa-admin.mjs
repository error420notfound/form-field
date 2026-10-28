import { randomBytes } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'

const file = '.local/medusa-admin.env'
if (existsSync(file)) { console.log('Existing local administrator credentials preserved in .local/medusa-admin.env. Use Medusa Admin to manage this account.'); process.exit(0) }
const email = 'dev-admin@formfield.invalid'
const password = randomBytes(32).toString('base64url')
const child = spawn(process.execPath, ['../../scripts/commerce-cli.mjs', 'user', '-e', email, '-p', password], { cwd: 'apps/commerce', stdio: ['inherit', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString() })
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => {
  if (code !== 0) { console.error(output.replaceAll(password, '[redacted]')); process.exitCode = code || 1; return }
  writeFileSync(file, `MEDUSA_ADMIN_EMAIL=${email}\nMEDUSA_ADMIN_PASSWORD=${password}\n`, { mode: 0o600 })
  console.log('Development administrator created with the supported Medusa CLI. Credentials are in .local/medusa-admin.env (ignored, mode 0600).')
})
