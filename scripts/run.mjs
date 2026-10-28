// Resolve workspace-local or hoisted tools without Windows .cmd shims.
import { createRequire } from 'node:module'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
const [tool, ...args] = process.argv.slice(2)
const require = createRequire(path.join(process.cwd(), 'package.json'))
let dir = path.dirname(require.resolve(tool))
while (!existsSync(path.join(dir, 'package.json'))) {
  const parent = path.dirname(dir)
  if (parent === dir) throw new Error(`Cannot locate ${tool}`)
  dir = parent
}
const file = path.join(dir, 'package.json')
const pkg = JSON.parse(readFileSync(file, 'utf8'))
const bin = typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0]
const child = spawn(
  process.execPath,
  [path.resolve(path.dirname(file), bin), ...args],
  { stdio: 'inherit', env: process.env },
)
let stopping = false
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopping = true; child.kill(signal) })
child.on('error', (error) => { console.error(error.message); process.exitCode = 1 })
child.on('exit', (code) => process.exit(stopping ? 0 : code ?? 1))
