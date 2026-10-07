# ddex-ern-382-mcp

Standalone **MCP server** for DDEX ERN 3.8.2. It gives MCP-capable clients access to format knowledge, element order, AVS values, composition guides, and offline XML/package validation.

It is independent of any distributor backend, database, or delivery vendor.

## Install and connect

For an MCP client that supports stdio, configure:

```json
{
  "mcpServers": {
    "ddex-ern-382": {
      "command": "npx",
      "args": ["-y", "ddex-ern-382-mcp"]
    }
  }
}
```

The package requires Node.js 20 or newer. To run from a source checkout:

```bash
npm install
npm run build
npm start
```

For development, `npm run dev` runs the TypeScript entrypoint directly.

## MCP tools

| Tool | Purpose |
|------|---------|
| `validate_ern_xml` | Smoke checks and full offline XSD validation of XML text or a file |
| `validate_package_dir` | Check BatchComplete, relative URL, DeliveryType, and the message MD5 |
| `explain_element` | Explain an element, attribute, or DDEX package concept |
| `element_sequence` | Show documented child order for an ERN container |
| `list_sequences`, `list_elements`, `list_enums`, `list_howtos` | Discover available knowledge |
| `avs_values` | Look up values from the vendored AVS schema or curated sets |
| `howto_compose` | Step-by-step guidance for common ERN scenarios |

## MCP resources

Markdown guides are available under `ddex-ern-382://guides/`:

- `ern-382-overview`
- `rdbt-order`
- `sdbt-order`
- `batchcomplete`
- `common-pitfalls`

## Validation scope

The server validates ERN 3.8.2 structure and the vendored XSD/AVS schema. Package checks cover documented general package conventions. A schema-valid message is not a guarantee that every DSP will accept it; DSPs and aggregators may require additional profiles and business rules.

ERN 4.x, Schematron, and DDEX Workbench are outside this package's current scope.

## Development and tests

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Schema licensing

The server source code is MIT licensed. The DDEX schemas under `vendor/ddex/` are copyrighted DDEX materials and are **not** covered by the MIT license. DDEX Evaluation/Implementation licensing applies to use and redistribution; see [LICENSE-NOTE.md](./LICENSE-NOTE.md) and the schema headers before redistribution.

## Links

- GitHub: https://github.com/devochkaskustikom/ddex-ern-382-mcp
- npm: https://www.npmjs.com/package/ddex-ern-382-mcp
