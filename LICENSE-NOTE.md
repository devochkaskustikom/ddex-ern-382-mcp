# Licence notes

## This package (MIT)

The TypeScript MCP server, knowledge guides, and validation glue in this repository are MIT-licensed. See LICENSE.

## DDEX schemas (NOT MIT)

Files under `vendor/ddex/` are **DDEX copyrighted schemas**:

| File | Source |
|------|--------|
| `ern-382/release-notification.xsd` | DDEX ERN 3.8.2. Official `ddex.net/xml/ern/382/` is retired from the public catalog. |
| `avs/avs.xsd` | DDEX Allowed Value Sets |

The schema header states: evaluating the standard requires the DDEX Evaluation Licence (https://kb.ddex.net/display/HBK/Evaluation+Licence+for+DDEX+Standards). Implementing and using it requires a DDEX Implementation Licence (http://ddex.net/apply-ddex-implementation-licence).

Obtain the appropriate licence from DDEX before shipping this package, or the vendored XSD, as a commercial or production product.

ERN 3.x is retired from the public ddex.net catalog in favour of ERN 4.x. These copies are retained so ERN 3.8.2 validation can run offline.
