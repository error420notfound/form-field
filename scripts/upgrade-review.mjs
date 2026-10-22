// Run with both applications stopped and after backing up CMS data/uploads.
import { spawnSync } from 'node:child_process'
import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const cmsDirectory = fileURLToPath(new URL('../apps/cms/', import.meta.url))
const require = createRequire(
  new URL('../apps/cms/package.json', import.meta.url),
)
require('dotenv').config({ path: path.join(cmsDirectory, '.env') })
const databaseURL = process.env.DATABASE_URL || 'file:./data/store.db'
if (!databaseURL.startsWith('file:'))
  throw new Error(
    'Review setup is for local SQLite only. Use reviewed migrations for remote databases.',
  )
const filename = path.resolve(cmsDirectory, databaseURL.slice(5))
let oldRequiredPrice = false
if (existsSync(filename)) {
  const db = new DatabaseSync(filename, { readOnly: true })
  try {
    oldRequiredPrice = db
      .prepare('PRAGMA table_info(products)')
      .all()
      .some((column) => column.name === 'price' && column.notnull === 1)
  } finally {
    db.close()
  }
}
function runStage(args, environment) {
  // Payload/Drizzle can commit a relationship-table rebuild before reporting an
  // already-created index. Re-enter only that specific completed additive stage.
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = spawnSync(process.execPath, args, {
      cwd: cmsDirectory,
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'development', ...environment },
    })
    if (result.status === 0) {
      process.stdout.write(result.stdout || '')
      process.stderr.write(result.stderr || '')
      return
    }
    const log = (result.stdout || '') + (result.stderr || '')
    if (
      attempt < 2 &&
      /SQLITE_ERROR: index (?:products_rels_order_idx|_products_v_rels_order_idx) already exists/.test(
        log,
      )
    ) {
      console.info('Completing Payload additive relationship index stage...')
      continue
    }
    process.stdout.write(result.stdout || '')
    process.stderr.write(result.stderr || '')
    process.exit(result.status ?? 1)
  }
}
if (oldRequiredPrice)
  runStage(
    [
      '--import',
      'tsx',
      '--input-type=module',
      '-e',
      "import 'dotenv/config'; import {getPayload} from 'payload'; import config from './src/payload.config.ts'; const p=await getPayload({config}); await p.destroy();",
    ],
    { FORM_FIELD_ADDITIVE_SCHEMA: '1' },
  )
for (const file of ['seed-review.ts', 'attach-review-media.ts'])
  runStage(['--import', 'tsx', 'src/' + file], {
    FORM_FIELD_ADDITIVE_SCHEMA: '0',
  })
