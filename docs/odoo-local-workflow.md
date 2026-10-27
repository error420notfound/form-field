# Form+Field local Odoo workflow

The local Odoo database is `form_field_demo`. Use warehouse **My Company (WH)**
for website fulfilment and the **Form+Field Website** sales team to identify
website orders. Demo checkout assigns orders to this sales team.

## Prepare a product

1. In Odoo, create a product and enable inventory tracking. Give each
   sellable product or variant a unique Internal Reference (SKU).
2. Add its actual stock to the WH warehouse using Odoo's inventory workflow.
3. In Payload, create or update the matching product with its product
   information and purchase eligibility. Review-only concepts remain
   unavailable until their details and eligibility are confirmed.
4. Link the Payload product ID to the Odoo product variant ID in the local
   `apps/cms/data/odoo-products.json` file. Its JSON keys are Payload IDs and
   its values are Odoo variant IDs. The local mapping currently links Payload
   PourFrame (4) to Odoo PourFrame (1, reference `POURFRAME-001`). Merely using
   the same name or reference does not create a link. Back up this mapping with
   the CMS data.

Linked product pages read available stock from Odoo; linked cart lines are
excluded if the requested quantity is unavailable or Odoo cannot be reached.
Linked product prices are read live from Odoo's sales price. Payload represents
prices in paise; the storefront displays them in rupees. Edit linked prices in Odoo. This does not
write the fetched price into Payload's database. If the Odoo price is
unavailable, the product is not purchasable. Unlinked products retain their
Payload price but cannot be ordered. Refresh an open page to see Odoo changes.
The existing editorial and purchase eligibility settings still apply.
This display is not a reservation or a guarantee of stock at order time.

## Demo order flow

Website orders are assigned to the website sales team and shipped from WH.
Odoo's delivery operation is configured to reserve stock at confirmation. The
integration checks that the requested quantities were actually reserved.
If a submission fails or its outcome is uncertain, inspect the order in Payload
and Odoo before making another attempt. The payment-free flow is restricted to
local development. Order records and delivery details are visible only to CMS
administrators. Odoo remains the source for later fulfilment status.

The demo checkout simulates a successful payment after stock is reserved.
Payload stores the simulated method and status, and the Odoo sales order note
records the same result with the website reference. This does not create an
Odoo payment transaction or accounting payment and collects no money. If the
order or Odoo update fails, check both systems before retrying.

Checkout requires a customer account. Payload links each new account to its own
Odoo customer using an account-specific reference. It does not attach older
guest orders or existing contacts based on an unverified email. Each order saves
its delivery address separately and appears in the customer's sales history.
Account creation and profile edits remain saved if Odoo is unavailable; sync is
retried at login, profile save, or checkout. Checkout waits for a successful
sync. Checkout does not create CRM leads or opportunities.

The local account flow has no email verification or password reset and is not
ready for production. Existing guest orders remain admin-only. Customer order
history shows current delivery state when Odoo is reachable and retains saved
order details when it is not.

Tax and shipping charges are awaiting business rules. Do not treat the current
cart subtotal or an Odoo default as a final customer charge. Razorpay is planned
for a later phase and is not connected.

## Local connection

The Odoo URL, database name, API key and optional `ODOO_WAREHOUSE_ID` and
`ODOO_SALES_TEAM_ID` (defaulting to `1` and `4` in this local setup) belong in `apps/cms/.env`, which is not
committed. Run `npm.cmd run check:odoo -w apps/cms` from the project root to
check the connection and list visible warehouses. Odoo API keys expire; replace
the local key when needed. Never put the key in client-side code.
