// Optional portable binary install for this Intel Mac; no global package changes.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

process.chdir(path.resolve(import.meta.dirname, '..'))
if (existsSync('.local/postgres-bin/bin/postgres')) { console.log('Local PostgreSQL binaries already exist; preserved.'); process.exit(0) }
if (process.platform !== 'darwin' || process.arch !== 'x64') throw new Error('Use your platform’s PostgreSQL installation and PG_BIN, or set an external DATABASE_URL. See docs/development.md.')
const version = '18.6.0'
const url = `https://repo.maven.apache.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-darwin-amd64/${version}/embedded-postgres-binaries-darwin-amd64-${version}.jar`
const expected = '690941008aac9ee360820fde9bb7870a4f3dcac5e9e2f9e45e42333a436ad0f9'
mkdirSync('.local', { recursive: true })
const response = await fetch(url)
if (!response.ok) throw new Error(`PostgreSQL download failed (${response.status}).`)
const bytes = Buffer.from(await response.arrayBuffer())
if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('PostgreSQL archive checksum mismatch.')
writeFileSync('.local/postgres.jar', bytes)
try {
  const archive = spawnSync('unzip', ['-p', '.local/postgres.jar', 'postgres-darwin-x86_64.txz'], { maxBuffer: 100 * 1024 * 1024 })
  if (archive.status !== 0) throw new Error('Cannot extract PostgreSQL archive.')
  mkdirSync('.local/postgres-bin', { recursive: true })
  const extract = spawnSync('tar', ['-xJ', '-C', '.local/postgres-bin'], { input: archive.stdout, stdio: ['pipe', 'inherit', 'inherit'] })
  if (extract.status !== 0) throw new Error('Cannot extract PostgreSQL binaries.')
  console.log('Portable PostgreSQL 18.6 installed in .local/postgres-bin. No system service was installed.')
} finally { rmSync('.local/postgres.jar', { force: true }) }
