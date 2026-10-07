# SoundRecordingDetailsByTerritory (SDBT) order

Practice-critical order when elements are present:

1. `TerritoryCode` *(or `ExcludedTerritoryCode`)*
2. `Title`
3. `DisplayArtist`
4. `ResourceContributor`
5. `IndirectResourceContributor`
6. `PLine`
7. `Genre`
8. `ParentalWarningType`
9. `TechnicalSoundRecordingDetails` → `File` (`URL` or `FileName`+`FilePath` + `HashSum`)

## SoundRecording body (before SDBT)

`IsInstrumental` → (`LanguageOfPerformance` if vocal) → `Duration` → optional `ResourceContainedResourceReferenceList` → `SoundRecordingDetailsByTerritory`.

`ResourceReference` must match `A[\d\-_a-zA-Z]+`.
