# DDEX ERN 3.8.2 schemas (vendor copies)

| File | Source |
|------|--------|
| `ern-382/release-notification.xsd` | https://raw.githubusercontent.com/sshaw/ddex/master/etc/schemas/ern/382/release-notification.xsd (DDEX ©) |
| `avs/avs.xsd` | http://ddex.net/xml/avs/avs.xsd |

`release-notification.xsd` `schemaLocation` patched to `../avs/avs.xsd` for offline use.

**Licence:** DDEX Evaluation / Implementation Licence applies for production use.
**Note:** Official `ddex.net/xml/ern/382/` returns 404 (ERN 3.x retired from public catalog; ERN 4.x is current). Full XSD+Schematron CI can use DDEX Workbench; our builder uses structural `ern-smoke.ts` plus these files as reference.

**Validation:** these copies are the actual validation schemas. `npm run ddex:validate -- <manifest.xml...>` (wraps `api/scripts/validate-ddex.ps1`, .NET `XmlSchemaSet`) validates ERN 3.8.2 manifests fully offline; `npm run ddex:sample` runs it on every generated package.