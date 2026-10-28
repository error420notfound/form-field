# form+field development

## Architecture and ownership

- npm workspaces; use Node 24 LTS and the root lockfile. Preserve unrelated changes and inspect Git status first.
- Astro (`apps/storefront`) owns customer-facing presentation. Reuse existing tokens, typography, components, product layouts and editorial experiences.
- Payload (`apps/cms`, hosted by Next) owns editorial content, media, specifications and CMS staff access. Preserve its existing SQLite database, uploads, collections, drafts and users. Read its nested AGENTS.md before Next changes.
- Medusa v2 (`apps/commerce`) owns commerce for explicitly Medusa-linked products: variants, SKUs, regional prices, sellable inventory, carts and eventually commerce customers/orders. Use supported Store/Admin APIs, SDK methods and workflows. Never integrate through internal database tables.
- **Parallel transition:** existing unlinked products, numeric Odoo configurations, `studio-cart-v1`, Payload customers and legacy demo orders remain operational. A linked story uses `medusaProductId`; never fall back to Odoo or Payload prices for it. Keep the new commerce bag and legacy demo checkout separate. Do not silently migrate selections or identities.
- Odoo is a future operations integration for the Medusa path. Do not introduce Odoo as a Medusa runtime dependency or build speculative ERP adapters. Its existing legacy integration is retained by explicit user choice.

## Conventions

- Use `npm run cli -w apps/commerce -- <command>` for Medusa tooling. The CLI wrapper scopes NODE_PATH to handle CommonJS lookups across npm workspaces without sharing React runtimes. Astro/Payload use React 19; Medusa Admin uses React 18.
- Consult installed package types/AGENTS.md and current official Medusa docs. The repository-scoped official skills are in `.agents/skills`; load relevant references when using them. Scope their generic recommendations to this existing application; do not redesign or add services merely because a skill suggests them.
- Medusa v2 prices are major units (INR rupees). Existing Payload/Odoo prices use integer paise. Never reuse the legacy formatter for Medusa amounts.
- Keep commerce SDK calls in the thin typed service layer. Do not put an administrator API key, database URL or customer token in shared/browser client configuration.
- Public environment names may expose only the backend URL and publishable key. Secrets stay in ignored `.env` or `.local` files, with placeholders in examples. Never print credentials.
- Payload product associations are additive and repairable through Payload Admin. Avoid bidirectional synchronization, implicit title/slug matching, or duplicating transactional values into editable editorial fields.
- Back up CMS data before schema work. Never reset/recreate the existing SQLite database or reuse it for Medusa. Run migration callbacks through supported tooling, review pending migration history and any development schema-push warnings. Do not approve destructive migrations without user authorization.
- PostgreSQL belongs to Medusa alone. The optional local cluster binds loopback and uses separate bootstrap/application roles. Redis, Docker, reverse proxies and production infrastructure are unnecessary for this single-process development setup.

## Checks and boundaries

- Run `npm test`, `npm run check`, commerce lint and relevant production builds after changes. Use `npm run test:commerce` with the local labeled fixture and running services for SDK/cart integration checks. Browser-test product selection, cart updates and responsive layout; installation or HTTP 200 alone is insufficient.
- Development fixtures are explicitly labeled, opt-in, and hidden from production editorial reads. Never invent real product facts or stock. No real customer accounts, orders or payment processing during integration checks.
- Existing Payload customers remain separate from Medusa customer auth. Do not transfer password hashes, share JWT secrets, or attach accounts/orders by email alone.
- Production checkout, Razorpay, deployment and Odoo adapters are deferred. The system is local development only; in-memory Medusa modules are not production infrastructure.

References: `docs/architecture.md`, `docs/commerce.md`, `docs/development.md`, `docs/integrations.md`, `docs/medusa-tooling.md`, and https://docs.medusajs.com/llms.txt.
