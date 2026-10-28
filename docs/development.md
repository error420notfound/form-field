# Local development

Use Node 24 LTS and npm 11. The host default Node 26 is outside this repository's supported range. On this Mac:

```sh
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm ci
npm run setup
npm run setup:commerce
```

`setup` preserves existing CMS/storefront environment files, SQLite data and uploads. `setup:commerce` creates missing commerce/local PostgreSQL credentials with mode 0600; it does not overwrite existing configuration.

## PostgreSQL

The optional local PostgreSQL cluster uses `.local/postgres-data`, port 5433, loopback networking, a bootstrap role and a separate `formfield_medusa` application role/database. It never uses the Payload SQLite database. All local binaries/data/secrets are ignored by Git. Stop services before copying `.local/postgres-data` for a cold backup; preserve its matching environment credentials too.

This Intel Mac uses PostgreSQL 18.6 universal macOS binaries redistributed by [Zonky](https://github.com/zonkyio/embedded-postgres-binaries) through Maven Central. `npm run setup:postgres` downloads the pinned archive and verifies its SHA-256 before extraction. No system service, Homebrew upgrade or Docker dependency is introduced. The binaries require macOS tools `unzip` and `tar` with xz support.

On other platforms, install a supported PostgreSQL release normally and point `PG_BIN` at its binaries, or provision a dedicated external PostgreSQL database and set `apps/commerce/.env` `DATABASE_URL`. `dev:all` starts the optional local cluster only for the configured local 127.0.0.1:5433 database; start an external database separately. The local helper never overwrites an existing database or resets an existing role's password.

For the bundled local cluster, first-time setup uses two terminals:

```sh
# Terminal 1, keep running
npm run setup:postgres
npm run dev:db

# Terminal 2
npm run migrate:commerce
npm run setup:store
npm run configure:commerce
npm run setup:medusa-admin
```

The local administrator is `dev-admin@formfield.invalid`; its generated password is stored in ignored `.local/medusa-admin.env`. Read it locally, never commit or paste it into logs. The setup command preserves existing credential files. Payload staff accounts and passwords are unchanged.

The existing CMS migrations include the additive Medusa association migration. Back up SQLite and review `npm run migrate -w apps/cms` pending history before applying it. A pre-existing `dev` migration marker causes a generic schema-push warning; do not blindly accept it or reset the database. The reviewed Medusa migration only adds columns/indexes. On this checkout it has already been applied and existing record values were checked against the pre-migration backup.

Optional fixture setup, with PostgreSQL available:

```sh
npm run seed:medusa-fixture
COMMERCE_SCHEMA_MANAGED=1 npm run seed:medusa-editorial
```

## Start and stop

```sh
# Stop the separately started database first, then run the whole environment:
npm run db:stop
npm run dev:all
```

`dev:all` checks ports, starts the local database, waits for readiness, and starts CMS, Astro and Medusa. Ctrl+C stops all managed children and PostgreSQL. A startup failure stops the group. It refuses occupied ports rather than starting duplicate apps. It does not run migrations automatically.

For the currently running agent-started local group, `npm run db:stop` is also a terminal-accessible stop command: stopping its managed database causes the supervisor to stop all three applications. With a separately started database, it stops only that local PostgreSQL cluster.

Individual commands remain available:

```sh
npm run dev              # existing CMS + Astro workflow
npm run dev:cms
npm run dev:storefront
npm run dev:commerce     # requires PostgreSQL already running
npm run dev:db
npm run db:stop          # stops only the repository-local PostgreSQL cluster
```

URLs: storefront http://localhost:4321, Payload Admin http://localhost:3000/admin, Medusa API http://localhost:9000, Medusa Admin http://localhost:9000/app. The joined fixture is http://localhost:4321/products/formfield-commerce-fixture and its bag is http://localhost:4321/commerce/cart.

## Environment and checks

| Application | Variables |
| --- | --- |
| CMS | Existing `PAYLOAD_SECRET`, SQLite `DATABASE_URL`, `CMS_URL`, `STOREFRONT_ORIGIN`; existing private Odoo configuration if available |
| Astro | `CMS_URL`; public `PUBLIC_MEDUSA_BACKEND_URL`, `PUBLIC_MEDUSA_PUBLISHABLE_KEY`; server-only `MEDUSA_REGION_ID` |
| Medusa | Dedicated PostgreSQL `DATABASE_URL`, `MEDUSA_BACKEND_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET` |

Restart Astro after changing its environment. Avoid setting a shared shell `DATABASE_URL` across applications; the CMS and Medusa use different databases. Keep origins consistent (`localhost` for browser applications). Production cookies require HTTPS. Redis is not needed for single-process local development; default in-memory event/locking modules are unsuitable for production or multiple workers.

```sh
npm test
npm run check
npm run lint -w apps/commerce
npm run build
npm run test:commerce    # all three apps + labeled fixture must be running
```

No browser dependencies are added to the project. Integration tests use only labeled fixture carts, create no orders/customers, and empty their own cart. The legacy Odoo connection/order flow requires existing private Odoo credentials; page accessibility alone does not verify live Odoo operations.
