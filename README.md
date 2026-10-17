# Form & Field

A local ecommerce foundation for an independent design studio. The working name and introduction live in Payload **Store Settings**; change them there to rebrand the storefront.

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

Edit products, upload images with descriptive alt text, set featured products, and edit Store Settings in Payload. Publish products to make them visible. Refresh Astro to see published changes without rebuilding. Draft changes remain private. Categories filter the shop; unavailable and coming-soon objects cannot be added to the cart. Storefront CSS tokens are in `apps/storefront/src/styles/global.css`.

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

Payment, order creation, taxes, shipping, customer accounts, variants, inventory reservations, discounts, and deployment are absent. The cart stores only IDs and quantities in localStorage, refreshes product details from Payload, and caps quantities at 99. Removed/unpublished/unavailable products are excluded from totals. Totals are local previews, not transaction values. Checkout has no submission or payment fields and does not persist addresses.

The initial catalogue fetch is limited to 100 products and 100 categories; add pagination before expanding beyond that. Public uploads are accessible by URL and should contain only publishable product imagery. No external fonts, image hosts, or paid services are needed. See [architecture](docs/architecture.md).

Dependency audit at setup reported upstream transitive advisories in Payload's tooling/UI dependency chain (including Drizzle tooling and Sass). Payload/Next and Sharp were updated to current compatible patched releases; the audit is not clean. Recheck `npm.cmd audit` when upgrading, and keep this foundation local. Email delivery is not configured; Payload uses its development console transport.
