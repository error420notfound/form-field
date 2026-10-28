# Commerce dashboard

The Payload dashboard has separate **Demo data** and **Odoo / live records** views. Demo records are fictional admin-only order and inventory snapshots; they are not storefront products or customer accounts. Demo payment and fulfilment actions do not contact Odoo, send email, or collect money. The existing Odoo-connected checkout remains a local simulation and its orders are excluded from live reporting.

## Upgrade the local database

Stop the CMS and storefront first. Back up `apps/cms/data/store.db` together with the uploads directory, including any SQLite WAL/SHM files, before changing the schema. From the repository root with Node 24 selected, run:

```sh
npm run migrate -w apps/cms
npm run seed:commerce -w apps/cms
```

Payload may warn that the database has previously used development schema push. Review the backup and migration state before proceeding. The new migration adds columns and a table and does not remove existing data; its rollback intentionally retains those additions. If Payload's development schema push reports an existing-index error on this database, run the CMS with `COMMERCE_SCHEMA_MANAGED=1` after applying migrations to disable schema push. This setting also means future schema changes must be migrated explicitly. Never point local demo commands at production data.

The seed can be run repeatedly; it does not overwrite existing entries. To remove only records tagged for this dashboard:

```sh
npm run clean:commerce -w apps/cms
```

## Reporting and sync

Dates are inclusive UTC dates. Net paid revenue is recorded payments minus recorded refunds in paise, displayed as INR; average paid order is net paid revenue divided by orders with a recorded payment. The order count includes all orders in the period. Product ranking counts ordered units, including returned and cancelled orders. Customers are distinct emails present in the order snapshots. Demo figures are simulated; live revenue is unavailable until real payment records are integrated. Visitor and conversion analytics are not connected.

The dashboard's refresh is a read-only Odoo operation, limited to local development. It records linked product stock and price and linked order fulfilment observations. Old snapshots remain visible with observation time and a failure indication if a refresh fails. A stock reading is not a reservation. If Odoo cannot be reached, no demo data substitutes for live data. The existing local connection and access requirements are described in `odoo-local-workflow.md`.

For a periodic local refresh, run `NODE_ENV=development npm run sync:commerce -w apps/cms` from a scheduler with the project directory and Node 24 in its environment. Arrange a non-overlapping schedule and capture its exit status and logs; the command exits unsuccessfully on partial failures. Do not expose Odoo credentials in scheduler logs. This is not a production synchronization worker.

Shipping, tax, refunds, payment provider integration, customer notification, shipment tracking ingestion, and production checkout require further work. The dashboard is not an accounting ledger. Do not use demo checkout for real orders.
