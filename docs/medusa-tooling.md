# Medusa development tools

## CLI

Medusa CLI 2.22.1 is project-local. Use the workspace command, which scopes CommonJS module lookup for npm's hoisted packages:

```sh
npm run cli -w apps/commerce -- --help
npm run cli -w apps/commerce -- -v
npm run dev:commerce
npm run migrate:commerce
npm run migrate:create -w apps/commerce -- <module-name>
npm run cli -w apps/commerce -- db:sync-links --help
npm run build -w apps/commerce
npm run setup:store
npm run setup:medusa-admin
```

`user -e <email> -p <password>` is the supported administrator command. Prefer the local setup helper for development so generated credentials are saved privately and not printed. Production credentials/accounts are outside this setup.

The official initializer now creates a monorepository by default. It was run in `/tmp`; its generated backend was integrated into this existing monorepository. No Git repository was initialized in form+field and no Next.js storefront was installed.

## Documentation MCP

Verified endpoint: https://docs.medusajs.com/mcp. Codex CLI 0.164.0-alpha.11.1 was already installed; existing MCP configuration was inspected without exposing tokens. A single `medusa` entry was added using:

```sh
codex mcp add medusa --url https://docs.medusajs.com/mcp
```

The endpoint requires Medusa Cloud authentication. OAuth was offered; the user chose to authenticate later. Complete this locally when convenient:

```sh
codex mcp login medusa
```

Configuration does not establish a working authenticated MCP session. Local Medusa functionality is independent of MCP. Until login, use the official docs and their `.md` representations or https://docs.medusajs.com/llms.txt. Sources: [Medusa MCP instructions](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/docs-mcp-server), [Codex MCP configuration](https://developers.openai.com/codex/mcp).

## Repository agent skills

Reviewed official [Medusa agent skills](https://github.com/medusajs/medusa-agent-skills) were installed with Codex's skill-installer Git fallback into `.agents/skills`:

- `building-with-medusa` — backend workflows, queries and module boundaries.
- `building-storefronts` — official SDK integration and type-safe Store API calls.
- `storefront-best-practices` — existing design consistency, cart and commerce UX.

`medusa-dev` and `ecommerce-storefront` are upstream plugin bundles; these directories are their portable skills. No Claude command, Cloud deployment tool, learning workflow or privileged script was installed. Skills become discoverable in a subsequent agent turn/session; the relevant instructions and references were read during this implementation. Preserve user/repository instructions when a generic skill recommendation conflicts with this existing project's scope.

The Codex installer initially encountered a local Python certificate-store error; its supported Git fallback succeeded without disabling TLS verification.
