# Integration boundaries

## Payload and Medusa

Astro combines a published Payload editorial record with a Medusa product fetched by stable `medusaProductId`. Payload owns narrative, photography, specifications, sections and editorial eligibility; Medusa owns transactional prices, configurations and inventory. No direct database join, duplicated editable commerce data, webhook endpoint, or synchronization loop is introduced.

The [official Payload guide](https://docs.medusajs.com/resources/integrations/guides/payload) describes manual/event-driven product synchronization and targets a specific older Payload version. Its additional collection/module and synchronization machinery are unnecessary here: this existing CMS already has editorial products. Explicit ID linking plus API composition is the initial integration. Repair a missing/deleted product association in Payload Admin. Future one-way event synchronization must remain idempotent and must never overwrite editorial content or create bidirectional update loops.

## Existing customers and checkout

Payload's `users` staff collection and `customers` storefront authentication already exist. Their accounts, sessions, profile operations and legacy order history stay in place. The existing demo checkout uses Payload customers and Odoo and remains separate from the anonymous Medusa cart. No customer is implicitly created or migrated into Medusa, and no email-only identity linking is performed.

A future customer transition should use Medusa's supported customer/emailpass or provider auth through the official SDK, require verified ownership before explicitly associating old accounts, preserve historical orders, and plan password reset/re-enrollment. Do not copy password hashes, share JWT secrets, forward Payload customer tokens to Medusa, or construct custom password handlers.

Future checkout will use the Medusa cart to collect customer information/addresses, list region-appropriate shipping options, refresh taxes/totals, initialize a supported provider's payment session, complete the cart and display an authorized order confirmation. Each stage must handle expired carts, changed prices/stock and indeterminate results. Razorpay provider selection, credentials, shipping/tax business rules and production payment verification are separate work. Cart totals are not a final quote; successful adds do not promise a stock reservation.

## Future Odoo operations

No new Odoo server, endpoint, MCP configuration or ERP adapter is installed. The existing legacy Odoo demo integration remains available by the user's parallel-transition decision. The Medusa path operates without it.

Future integration candidates:

- Trigger from an explicitly defined paid/authorized order state, with payment semantics chosen for the eventual provider. Do not equate cart creation, order placement and payment confirmation.
- Map stable Medusa product/variant IDs and unique SKU to Odoo product IDs. Maintain an explicit mapping; title/slug similarity is insufficient.
- Map order IDs, line quantities, addresses, currency, taxes, discounts and payment references to an Odoo sales order. Define cancellation, refund, return and fulfilment mappings separately.
- Use an integration-owned idempotency key per Medusa event/order and destination operation. Deduplicate retries and make replay observable; do not create duplicate sales orders after timeouts.
- Persist delivery attempts, support bounded backoff and a dead-letter/manual repair workflow, redact personal data from logs and authenticate event delivery. Reconcile out-of-order events and partial failures.
- Medusa currently owns sellable inventory. Before Odoo becomes authoritative for physical warehouse quantities, decide reservation ownership, available-to-sell calculations, reconciliation and conflict handling. Never let both systems independently decrement the same stock.

The conceptual boundary is Medusa order/payment event → durable integration layer → Odoo operations. It is documentation only in this phase; commerce has no new ERP runtime dependency.
