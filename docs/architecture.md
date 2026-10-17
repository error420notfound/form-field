# Local architecture

## Responsibilities

`apps/cms` runs Payload within its supported Next.js HTTP and admin application. Payload owns authentication, content, generated TypeScript types, local SQLite persistence through `@payloadcms/db-sqlite`, and image uploads/resizing through Sharp. No customer-facing pages are built in Next.js.

`apps/storefront` runs Astro 7.4 with the official Node adapter in standalone server mode. It renders HTML per request, uses plain CSS tokens, and enhances gallery, category and cart controls with small TypeScript scripts. It imports Payload types only; it does not initialize Payload or access SQLite directly.

## Content flow and interfaces

Administrator → Payload admin → SQLite/uploads → public REST API → Astro server → HTML. `src/lib/cms.ts` in the storefront centralizes API requests, timeout/error messages, generated types, price formatting, and relative media URL resolution. Requests carry no administrator cookies or credentials and do not cache content. All brand-bearing shared components receive Store Settings values.

The Products collection contains descriptive text, Media and Category relationships, integer paise prices, INR, availability, optional specifications, feature items, featured/demo flags and Payload draft versions. Store Settings is the central editable store identity and homepage copy. Payload generates the REST endpoints and types from this configuration.

Public readers see only published products. CMS administrators can mutate all content, upload media, and inspect drafts and user records. Payload's first-user setup is the sole initial administrator bootstrap. CORS is restricted to the configured storefront origin; it is not authentication. Versions are administrator-only. Media and categories are public; unpublished image files are not a private asset vault.

## Cart and checkout

localStorage key `studio-cart-v1` contains only `{ id, quantity }` selections. Astro's POST `/api/cart` accepts at most 100 selections with positive numeric IDs and integer quantities from 1–99, and resolves current published details through Payload REST. The response contains display lines, availability, formatted prices, normalized image URLs and an indicative subtotal. Unknown products are represented as unavailable lines; unavailable items are excluded from totals. API failures preserve local selections and expose a retry control.

The cart endpoint has no order side effects. Checkout uses the same resolution, a disabled payment button, and an address layout form with submission prevented and no persistence handler. No payment or address data is sent to the CMS. Browser autofill remains controlled by the user's browser.

## Persistence, schema and limitations

SQLite data and uploads are outside generated output. Back up the database and uploads as a matching set while processes are stopped; see README. Schema evolution uses Payload's supported migration tooling. Changing database adapters requires planning data migration rather than simply changing an environment variable.

This foundation intentionally has no checkout authority, payment processing, orders, stock reservations, variants, discounts, customer auth or deployment infrastructure. Catalogue queries currently cap results at 100; pagination is a future addition. Product descriptions are plain multiline text, rendered escaped by Astro. Seed illustrations are authored SVG scenes rasterized locally to PNG so Payload generates useful image sizes. Seed content has no independent storefront catalogue.

Official references: [Payload installation](https://payloadcms.com/docs/getting-started/installation), [SQLite](https://payloadcms.com/docs/database/sqlite), [REST](https://payloadcms.com/docs/rest-api/overview), [drafts](https://payloadcms.com/docs/versions/drafts), [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/).
