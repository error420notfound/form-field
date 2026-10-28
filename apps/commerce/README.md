# form+field commerce

Medusa 2.22.1 backend and bundled Admin, generated with the official initializer and integrated into this repository's npm workspaces. This application is independent of the existing Payload/Odoo demo commerce path.

From the repository root, use `npm run setup:commerce`, `npm run dev:db`, `npm run migrate:commerce`, `npm run setup:store`, `npm run configure:commerce`, and `npm run dev:commerce`. See [local development](../../docs/development.md) for complete setup, administrator credentials, optional portable PostgreSQL and the single-command environment.

The default Medusa modules use PostgreSQL and single-process in-memory development infrastructure. There is no Redis, payment provider, Odoo adapter or production deployment. See [commerce](../../docs/commerce.md), [integrations](../../docs/integrations.md), and [tooling](../../docs/medusa-tooling.md).
