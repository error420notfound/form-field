// Optional local development cluster. External DATABASE_URL users do not need it.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { createRequire } from 'node:module'

const root = path.resolve(import.meta.dirname, '..')
process.chdir(root)
const command = process.argv[2] || 'start'
const bin = process.env.PG_BIN || path.join(root, '.local/postgres-bin/bin')
const data = path.join(root, '.local/postgres-data')
const env = { ...process.env, LC_ALL: 'C', LANG: 'C' }
if (!existsSync(path.join(bin, 'postgres'))) throw new Error('PostgreSQL binaries missing. See docs/development.md; set PG_BIN or use an external DATABASE_URL.')
function run(name, args) {
  const result = spawnSync(path.join(bin, name), args, { stdio: 'inherit', env })
  if (result.status !== 0) throw new Error(`${name} failed (${result.status}).`)
}
if (command === 'stop') {
  run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop'])
  process.exit(0)
}
process.loadEnvFile('.local/postgres.env')
process.loadEnvFile('apps/commerce/.env')
const database = new URL(process.env.DATABASE_URL)
if (database.hostname !== '127.0.0.1' || database.port !== '5433' || database.pathname !== '/formfield_medusa') {
  throw new Error('The local cluster command only supports 127.0.0.1:5433/formfield_medusa. Start your external database separately.')
}
const probe = net.createServer()
await new Promise((resolve, reject) => probe.once('error', reject).listen(5433, '127.0.0.1', resolve))
await new Promise(resolve => probe.close(resolve))
if (!existsSync(path.join(data, 'PG_VERSION'))) {
  mkdirSync(data, { recursive: true, mode: 0o700 })
  const pw = path.join(root, '.local/.postgres-pw')
  writeFileSync(pw, process.env.PG_LOCAL_PASSWORD, { mode: 0o600 })
  try { run('initdb', ['-D', data, '-U', 'formfield_local', '--pwfile', pw, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C']) }
  finally { unlinkSync(pw) }
}
const child = spawn(path.join(bin, 'postgres'), ['-D', data, '-h', '127.0.0.1', '-p', '5433', '-k', path.join(root, '.local')], { stdio: 'inherit', env })
let stopping = false
function stop() { if (!stopping) { stopping = true; child.kill('SIGINT') } }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
child.on('exit', code => process.exit(stopping ? 0 : code ?? 1))
const require = createRequire(path.join(root, 'apps/commerce/package.json'))
const { Client } = require('pg')
let client
for (let attempt = 0; attempt < 60; attempt++) {
  if (child.exitCode !== null) throw new Error('PostgreSQL stopped during startup.')
  const candidate = new Client({ host: '127.0.0.1', port: 5433, user: 'formfield_local', password: process.env.PG_LOCAL_PASSWORD, database: 'postgres' })
  try { await candidate.connect(); client = candidate; break }
  catch { await candidate.end().catch(() => {}); await new Promise(resolve => setTimeout(resolve, 250)) }
}
if (!client) { stop(); throw new Error('PostgreSQL did not become ready.') }
try {
  const role = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'formfield_medusa'")
  if (!role.rowCount) {
    // Fixed identifier, escaped literal from a generated or locally supplied password.
    const literal = (await client.query('SELECT quote_literal($1) AS value', [decodeURIComponent(database.password)])).rows[0].value
    await client.query(`CREATE ROLE formfield_medusa LOGIN PASSWORD ${literal}`)
  }
  const db = await client.query("SELECT 1 FROM pg_database WHERE datname = 'formfield_medusa'")
  if (!db.rowCount) await client.query('CREATE DATABASE formfield_medusa OWNER formfield_medusa')
  console.log('Medusa PostgreSQL ready on 127.0.0.1:5433 (persistent local cluster).')
} catch (error) { stop(); throw error }
finally { await client.end() }
