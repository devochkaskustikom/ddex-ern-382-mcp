# DDEX ERN 3.8.2 overview

- **Schema id:** `MessageSchemaVersionId="ern/382"`
- **Namespace:** `http://ddex.net/xml/ern/382`
- **Root:** `NewReleaseMessage` (also used for updates; takedown intent lives in BatchComplete `DeliveryType`)

## Message skeleton

1. `MessageHeader`
2. `ResourceList` - `SoundRecording*`, `Image*`, `Text*`, …
3. `ReleaseList` - `Release` (+ `ReleaseDetailsByTerritory`)
4. `DealList` - `ReleaseDeal` / `Deal` / `DealTerms`

## Package

Alongside the ERN XML, a delivery package normally includes:

- assets referenced by **relative** paths
- `BatchComplete` with filled `MessageInBatch` (DeliveryType, MD5)
- FTP **binary** upload; **BatchComplete last**

## Validation layers

1. Structural smoke (required sections + critical child order)
2. Full XSD (`release-notification.xsd` + `avs.xsd`) offline

XSD validity ≠ acceptance by every DSP. Partners add overlays (genres, roles, profile namespaces).

## Licence

Vendored XSD/AVS are DDEX copyright; Evaluation/Implementation licence applies for production redistribution. See `LICENSE-NOTE.md`.
