# Medusa commerce

Medusa 2.22.1 is the stable release verified against npm and the official documentation on 28 October 2026. It is an isolated generated backend in `apps/commerce`; Astro remains the storefront. Medusa Admin is at http://localhost:9000/app. Payload remains at http://localhost:3000/admin.

The application was generated with the official `create-medusa-app@2.22.1`, `--skip-db --no-browser --use-npm --version 2.22.1`. Its optional Next storefront and Claude plugin were declined. Only its backend was integrated into the existing workspaces. Generated European merchandise/policy seeds were removed before migrations; no arbitrary commercial policies or real merchandise were imported. The generated UI dependency was aligned to 4.2.8 to satisfy Medusa's published peer requirement.

## Ownership and association

Medusa owns commerce for products linked through Payload's optional, unique `medusaProductId`. Payload keeps the original product ID, slug, story, media, specifications, layouts, SEO-related content and editorial purchase restrictions. Store API responses supply configurations, SKU, prices and availability. Astro composes these into the existing product page and cards.

Link a published story in Payload Admin by copying its stable `prod_…` ID from Medusa Admin. Publish the editorial change, then open the existing product URL. The Medusa product must be published, assigned to **form+field Storefront**, have INR variant prices, and have inventory at a location linked to that channel. Review-only/unavailable/ineligible stories cannot be added. A broken association or backend outage shows unavailable commerce details; there is no legacy-price fallback. Repair the ID in Payload; clearing it explicitly restores the legacy flow without migrating any cart.

The additive CMS migration adds nullable association columns to products and their versions, plus indexes. Existing legacy values stay stored; linked stories suppress their old price on reads. Legacy Odoo image mappings retain numeric IDs; new commerce currently uses the editorial gallery and does not reinterpret those mappings as Medusa variant IDs.

## Store configuration

`npm run setup:store` idempotently creates India (`in`), INR (`inr`), **form+field Storefront**, **form+field Astro** publishable API key, and **form+field Development** stock location. It links the key and stock location to the channel using supported workflows. It saves public configuration in ignored `.local/commerce-public.json`; `npm run configure:commerce` writes only the URL, publishable key and region into the storefront environment.

Medusa creates a default store/channel internally. Setup explicitly selects form+field's channel and India as the store defaults and makes INR the default currency, preserving any other supported currencies. The unused generated default channel is retained; the Astro publishable key is linked only to the form+field channel.

The key is a public Store API key, with no administrative authority. No production payment provider, shipping rates, tax policy or returns policy is configured. India/INR setup is not a statement that production checkout is ready. The built-in manual/system payment provider is unnecessary for this cart-only phase and is not enabled on this region.

## SDK and cart

`src/lib/commerce` in Astro contains the Store API client, product composition, price formatting, purchase guards and cart response mapping. Native SDK methods are used for Medusa products, regions and carts. Medusa amounts are **rupees**, not paise: `123.45` formats as `₹123.45`. The legacy `price()` formatter remains separate.

The browser calls same-origin `/api/commerce/cart`. GET retrieves the current cart, or returns `cart: null`. POST accepts only these actions:

```ts
{ action: 'add', productId: number, variantId: string, quantity: number }
{ action: 'update', lineId: string, quantity: number }
{ action: 'remove', lineId: string }
```

The server validates the published Payload association and Medusa variant, accepts quantities 1–99, and lets Medusa enforce inventory and calculate totals. Cart creation happens on the first valid add. The cart ID stays in `ff_medusa_cart_v1`, an HTTP-only, SameSite=Lax cookie scoped to `/api/commerce`, with Secure enabled in production. The cart ID is an anonymous cart capability; it is not a customer identity. Origin checks protect mutations; responses are private/no-store, and private backend errors are replaced with customer-safe messages.

Successful server responses update UI state; failed/uncertain mutations retain the current view and ask for a refresh rather than automatically retrying an add. Tabs refresh via BroadcastChannel and window focus. Missing/completed/wrong-region cart identities are forgotten; transient backend errors preserve identity. The commerce bag is `/commerce/cart`; checkout is visibly unavailable. It never calls `/api/demo-order`.

## Fixtures

`npm run seed:medusa-fixture`, then `npm run seed:medusa-editorial`, creates one clearly labeled local fixture, two synthetic configurations priced at ₹123.45 and ₹234.56, and ten test units each. Reruns preserve existing fixture quantities and content. The editorial fixture has no invented specifications or photography and is excluded from production public reads. No fixture seed creates customers or orders.

The fixture is deliberately retained for local review. To remove it, first delete its linked editorial fixture in Payload Admin and delete the matching **Development commerce fixture** in Medusa Admin. These are optional manual cleanup actions; never run broad product deletion scripts.

Sources: [installation](https://docs.medusajs.com/learn/installation), [initializer](https://docs.medusajs.com/resources/create-medusa-app), [SDK](https://docs.medusajs.com/resources/js-sdk), [storefront development](https://docs.medusajs.com/resources/storefront-development).
