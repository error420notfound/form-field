# Medusa integration: audit and execution plan

Audit date: 28 October 2026. Starting branch: `master`, clean working tree.

## Existing application

- npm workspaces (`apps/*`), one root lockfile, Node 24 required. Host default Node 26 is outside the repository range; use the installed Node 24.21.0.
- Astro 7.4.0 at `apps/storefront`, SSR Node adapter, React islands, Tailwind/shadcn source and custom design tokens. Port 4321; an additional existing Astro process occupies 4322.
- Payload 3.91.0 at `apps/cms`, hosted by Next 16.4.2 on port 3000. SQLite adapter and `apps/cms/data/store.db`; uploaded media in `apps/cms/uploads`. Preserve both. Existing migrations and generated types are checked in.
- Existing products own editorial data plus legacy price/purchase fields and numeric Odoo variant image mappings. Live Odoo prices are overlaid by a read hook. Existing customer auth, account routes, orders, inventory projections, commerce dashboard, configurator and demo checkout already exist.
- Existing cart uses `studio-cart-v1` numeric Payload/Odoo selections. `/api/cart` resolves current stock; `/api/demo-order` creates legacy development orders. These contracts remain separate from Medusa.
- Existing `.env` files contain Payload configuration and CMS URL. No Odoo credentials were present in this checkout at audit time. Environment values are never printed.
- Ports 3000, 4321 and 4322 already have running Node services. Medusa port 9000 and local PostgreSQL port 5433 were free. No usable PostgreSQL binaries were found on PATH or in common installation paths.
- Existing `docs/architecture.md` checkout description predates current customer/Odoo functionality; source code takes precedence.

## Execution plan

1. Generate an official Medusa 2.22.1 backend in temporary storage, decline its storefront and Claude plugin, then integrate the backend as `apps/commerce` without its nested Git repository or workspace lockfile.
2. Provision a dedicated repository-local PostgreSQL cluster/database with loopback networking and ignored credentials. Homebrew was stopped when it proposed system dependency upgrades; portable PostgreSQL avoids those changes. External PostgreSQL remains supported via `DATABASE_URL`.
3. Run supported migrations and idempotent India/INR/channel/key setup. Use only labeled development fixtures for cart verification; create no customer accounts or orders.
4. Add an optional Payload Medusa product association with an additive migration and backup. Compose editorial and Store API data in Astro; never use legacy price or stock as a Medusa fallback.
5. Add a separate real Medusa cart and adapt existing product purchase controls. Preserve the legacy bag, customer access and Odoo checkout. Do not mix carts, identities or totals.
6. Extend scripts, repository agent instructions and documentation. Review and install compatible official Medusa skills; inspect MCP configuration and authenticate only through the supported flow.
7. Verify real Store API/cart operations, Admin, CMS/media, desktop/mobile UI, existing tests, types and production builds. Document unavailable credentials and all verification limits.

## Deliberate transition boundary

The user selected parallel operation. Odoo remains a dependency of the **legacy** demo flow. New Medusa commerce has no Odoo runtime dependency. Payload remains on SQLite; PostgreSQL is dedicated to Medusa. Customer/password migration, production checkout, Razorpay, production infrastructure and ERP adapters are deferred.
