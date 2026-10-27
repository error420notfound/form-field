# Form & Field

A local, story-led storefront for **form+field**, built with Astro, Payload, React islands and shadcn/ui. The design follows `ecomm-design.md`; the shared catalogue stays neutral while product stories theme the full document.

## Prerequisites and installation

Use Node.js 24 LTS (tested with 24.21.0) and npm 11. This repository uses plain npm workspaces. From the repository root:

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run generate:types
```

On macOS/Linux, use `npm` instead of `npm.cmd`. Scripts call Node entrypoints directly so the Windows project path can contain spaces and `&`. The original empty root `index.html` is preserved and is not an application entrypoint.

## Environment setup

`setup` creates missing `.env` files and local data directories. It generates a cryptographically random CMS secret without printing it and preserves existing environment files. See each application's `.env.example` for the variables. Keep the secret private; changing it invalidates sessions. CMS_URL is a server-side setting, not a browser credential. Restart applications after environment changes.

## Run locally

```powershell
npm.cmd run setup
npm.cmd run dev
```

- Storefront: http://localhost:4321
- CMS: http://localhost:3000
- Admin: http://localhost:3000/admin

Independent commands: `npm.cmd run dev:cms` and `npm.cmd run dev:storefront`. Stop with Ctrl+C. Both applications are intended for local use.

## First administrator and demonstration content

Open `/admin` and use Payload's first-user form to create your administrator. No administrator is seeded, and no credentials are hardcoded. All users in the Users collection are CMS administrators; customer accounts are not implemented. Do not expose an uninitialized CMS to other users.

In a second terminal, explicitly run:

```powershell
npm.cmd run seed
```

This creates three clearly fictional demonstration products, categories, locally authored illustrations, and initial store settings. It never runs automatically. Re-running skips existing product slugs and media filenames and preserves existing store settings. Sample prices and specifications are demonstration content, not claims about real products. The contact address uses the reserved `.test` domain.

## Design and edit

Edit products, story chapters, editorial order, broad/paired homepage modules, approved theme IDs and related objects in Payload. Upload media with descriptive alt text, provenance and desktop/mobile focal points. Publish stories independently of purchase eligibility. Unknown prices stay unknown; an available status, supplied integer price, purchase eligibility and a cleared local-review flag are all needed for Add to bag. Existing priced demo records remain compatible. Storefront tokens are in `apps/storefront/src/styles/global.css`. The public brand is fixed to form+field. Store Settings still supplies confirmed contact information.

## Checks and production builds

```powershell
npm.cmd run generate:types
npm.cmd run check
npm.cmd run build
```

Stop the development processes before building or starting production locally. Run `npm.cmd run start -w apps/cms` and `npm.cmd run start -w apps/storefront` in separate terminals. Set `PORT=4321` for the Astro production process (PowerShell: `$env:PORT='4321'`). Ensure the CMS database schema is prepared before production startup.

## Local persistence and backups

SQLite lives at `apps/cms/data/store.db`, with any SQLite journal/WAL/SHM sidecars alongside it. Media and generated image sizes live at `apps/cms/uploads`. Both survive builds and are ignored by Git, along with secrets and build output.

To back up: stop both applications and any seed/migration processes, then copy the entire `apps/cms/data` and `apps/cms/uploads` directories to a dated backup together. Protect a separate copy of your CMS `.env`. Restore with applications stopped, restoring the matching database and uploads together. A live file copy of SQLite is not a supported backup method here.

Payload pushes schema changes during development. Back up before changing schemas and review any destructive prompts. Use Payload's supported migrations for controlled schema evolution: `npm.cmd run migrate:create -w apps/cms`, review the generated migration, then `npm.cmd run migrate`. Keep migrations in version control. Do not mix development schema pushes and production migrations on the same database without following Payload's workflow. Switching adapters later may require explicit data and media migration.

## Intentionally deferred

Real payment, taxes, shipping rates, variants, discounts, and deployment are absent. Local customer accounts use Payload authentication; email verification and password recovery are not configured. Demo checkout requires a customer account, creates Odoo sales orders, checks reservations and stores order and delivery details in Payload. It collects no payment and must not be used for real orders. See [local Odoo workflow](docs/odoo-local-workflow.md). The cart stores IDs and quantities in localStorage and refreshes product details and availability.

The initial catalogue fetch is limited to 100 products and 100 categories; add pagination before expanding beyond that. Public uploads are accessible by URL and should contain only publishable product imagery. Fonts and review imagery are served locally; no external font or image requests are required. See [architecture](docs/architecture.md).

Dependency audit at setup reported upstream transitive advisories in Payload's tooling/UI dependency chain (including Drizzle tooling and Sass). Payload/Next and Sharp were updated to current compatible patched releases; the audit is not clean. Recheck `npm.cmd audit` when upgrading, and keep this foundation local. Email delivery is not configured; Payload uses its development console transport.

## Redesign review collection

With both applications stopped, back up CMS data/uploads, then run:

```powershell
npm.cmd run setup:review
npm.cmd run dev
```

The idempotent review setup uses two additive SQLite upgrade stages, creates four published local-review concepts, and attaches their labelled imagery. It skips existing review slugs and preserves existing galleries and other product records. Run this command before opening an older database with the redesigned app; SQLite/Drizzle must add new columns before relaxing the old required price constraint. This is a local development upgrade, not a production migration workflow.

The homepage leads with PourFrame, Lighting, Macro keypad and Thermal printer. Existing fictional demo records remain in Objects and can exercise Bag interactions. No prices, specifications or shipping promises are invented for the four review objects. Names other than PourFrame, colour assignments, copy and images remain drafts. Related objects appear only when explicitly selected in Payload.

Routes: Home, Objects (`/shop`), product stories, About, Support, Bag (`/cart`) and demo checkout. The header Bag opens a themed sheet; the standalone Bag and checkout use the neutral theme. All Bag controls share the existing `studio-cart-v1` storage contract. Demo checkout submits an order without payment in local development.

Faculty Glyphic and Geist are self-hosted through Fontsource. Font and Keyline licences are retained in `docs/licences`. Review asset provenance is in `docs/design/asset-provenance.json`; these AI-generated references are expressly not product photography or confirmed designs. Chroma snapshots and source revision are under `apps/storefront/src/data`.

Use Node 24. Validation commands: `npm.cmd test`, `npm.cmd run check`, `npm.cmd run build`. The purchase-policy tests protect unknown-price and review eligibility rules. Browser verification and intentional concept corrections are recorded in `docs/design/review.md`.
