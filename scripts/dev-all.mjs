import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

process.chdir(path.resolve(import.meta.dirname, '..'))
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Select Node 24 before starting this workspace.')
const commerceEnv = parseEnv(readFileSync('apps/commerce/.env', 'utf8'))
const database = new URL(commerceEnv.DATABASE_URL)
const localDatabase = database.hostname === '127.0.0.1' && database.port === '5433'
for (const port of [3000, 4321, 9000, ...(localDatabase ? [5433] : [])]) for (const host of ['localhost', '127.0.0.1']) {
  const server = net.createServer()
  await new Promise((resolve, reject) => server.once('error', () => reject(new Error(`Port ${port} is occupied. Stop that application before npm run dev:all.`))).listen(port, host, resolve))
  await new Promise(resolve => server.close(resolve))
}
const children = new Set()
let ending = false
function finish(code) {
  if (ending) return
  ending = true
  process.exitCode = code
  for (const child of children) child.kill('SIGTERM')
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => finish(0))
function launch(args, stdio = 'inherit') {
  const child = spawn(process.execPath, args, { stdio, env: { ...process.env, ASTRO_DEV_BACKGROUND: '0', COMMERCE_SCHEMA_MANAGED: '1' } })
  children.add(child)
  child.on('error', error => { console.error(error.message); finish(1) })
  child.on('exit', code => { children.delete(child); if (!ending) finish(code ?? 1) })
  return child
}
if (localDatabase) {
  const db = launch(['scripts/postgres.mjs'], ['inherit', 'pipe', 'inherit'])
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { finish(1); reject(new Error('Local PostgreSQL startup timed out.')) }, 60000)
    db.stdout.on('data', chunk => {
      process.stdout.write(chunk)
      if (chunk.toString().includes('Medusa PostgreSQL ready')) { clearTimeout(timeout); resolve() }
    })
    db.once('exit', () => { clearTimeout(timeout); reject(new Error('Local PostgreSQL failed to start.')) })
  })
}
if (!ending) launch(['node_modules/concurrently/dist/bin/concurrently.js', '-k', '-n', 'cms,storefront,commerce', 'npm run dev:cms', 'npm run dev:storefront', 'npm run dev:commerce'])
