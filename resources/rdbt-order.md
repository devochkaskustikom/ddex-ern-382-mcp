# ReleaseDetailsByTerritory (RDBT) order

XSD `xs:sequence` is order-strict. Practice-critical order when elements are present:

1. `TerritoryCode` *(or `ExcludedTerritoryCode`)*
2. `DisplayArtistName`
3. `LabelName`
4. `Title` (`DisplayTitle` + optional `SubTitle`)
5. `DisplayArtist`
6. `ParentalWarningType`
7. `ResourceGroup` - release-level contributors live **here**, not as RDBT siblings
8. `Genre`
9. `PLine`
10. `CLine`
11. `ReleaseDate`
12. `OriginalReleaseDate`

After RDBT on `Release`: `GlobalReleaseDate`, `GlobalOriginalReleaseDate`.

## Pitfalls

- Do **not** put `PLine` / `CLine` directly on `Release`
- Do **not** put `ResourceContributor` as a direct RDBT child (use `ResourceGroup`)
