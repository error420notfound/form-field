# Form & Field management workspace

The Payload admin groups website and commerce collections and includes a Form & Field overview. Products and website pages support drafts; owners publish them. The existing Astro pages remain public until a corresponding website page is published. Starter page drafts are optional and do not change the public site.

## Upgrade an existing local database

Stop the CMS and storefront. Back up `apps/cms/data/store.db`, any SQLite WAL/SHM files, and `apps/cms/uploads` before applying migrations. Use Node 24 and run from the repository root:

```sh
npm run migrate -w apps/cms
npm run seed:website -w apps/cms
npm run seed:commerce -w apps/cms
COMMERCE_SCHEMA_MANAGED=1 npm run dev
```

Payload may warn that the database was previously changed by development schema push. Verify the backup and migrations before proceeding. Existing staff accounts become owners during migration. New accounts default to editor. The website seed creates missing drafts only, and the commerce seed is optional fictional data. See `commerce-dashboard.md` for demo cleanup and Odoo sync details. `COMMERCE_SCHEMA_MANAGED=1` disables automatic schema push; subsequent changes need migrations.

## Staff and publishing

Owners manage users, settings and publication. Editors can edit product and website drafts and upload new media; modifying existing media and categories is reserved for owners because those collections do not have draft publication. Operations staff can view commerce records and reporting. Odoo-owned orders and inventory snapshots are read-only in Payload. Staff should make fulfilment changes in Odoo. Accounts and production security must be reviewed before deployment.

Website Pages provides Home, About, Support and Navigation and footer documents. Sections can be reordered and use approved kinds. Published navigation links must be site-relative. The default site stays in place until a matching document is published. Product stories continue to use the existing product fields. Support question sections can be edited individually. Check starter drafts against the current site before publishing: their presentation is not a pixel-identical copy of every existing section.

The Preview control opens the saved draft on the Astro storefront. Sign in to Payload and use the same hostname for both CMS and storefront (ports may differ, for example `localhost:3000` and `localhost:4321`) so the editor session cookie is available. Preview requires owner/editor access, sends no-store headers, and is not indexed. A different-host deployment needs a separate cross-domain preview session mechanism before draft preview will work. Publishing remains an owner action.

Commerce reports use recorded order data only; website visitor and conversion tracking are not configured. Real payments, production checkout, customer notifications and a production Odoo synchronization worker are not included. No demo figures should be treated as live business results.
