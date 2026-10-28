# Local Apple reference demonstrations

The iPhone Duo, Apple TV 4K, Siri AI, Apple Creator Studio, Apple Intelligence, Final Cut Pro, Logic Pro, Pixelmator Pro and Keynote stories use the supplied Apple material for local review only. The five individual digital experience pages use static interface examples and link to their related overview. The iPhone story includes a separate Apple Watch manufacturing feature. Claims are attributed to the supplied briefs and have not been independently verified. Public use requires appropriate rights and verification.

With Node 24 and the local CMS configured, run:

```sh
npm run seed:apple-demos -w apps/cms
```

The default source is `/Users/hs108/Downloads/New Folder With Items`. Set `APPLE_DEMO_SOURCE` to another folder containing the same named media subfolders if necessary. The command creates published local review records and optimized Payload media; it skips an existing product and reuses already imported media, preserving CMS edits on subsequent runs. HomeView retains its separate `seed:homeview` workflow.

These records are non-purchasable. Reserved demo slugs are filtered from production product reads and storefront routes. Media uses the existing `local-homeview-demo` role so anonymous production media access applies the same restriction to both old and new prototype assets. The assets must remain local; do not copy them into a public static directory.
