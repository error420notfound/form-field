// Scope CommonJS dynamic package resolution to this workspace. Medusa's hoisted
// utilities otherwise cannot find a workspace-local @medusajs/medusa package.
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const app = path.resolve(import.meta.dirname, '../apps/commerce')
const require = createRequire(path.join(app, 'package.json'))
const manifest = require.resolve('@medusajs/cli/package.json')
const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
const cli = path.resolve(path.dirname(manifest), typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.medusa)
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: app, stdio: 'inherit',
  env: { ...process.env, NODE_PATH: [path.join(app, 'node_modules'), path.resolve(app, '../../node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter) },
})
let stopping = false
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopping = true; child.kill(signal) })
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => process.exit(stopping ? 0 : code ?? 1))
