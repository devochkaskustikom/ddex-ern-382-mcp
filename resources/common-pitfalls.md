# Common ERN 3.8.2 pitfalls

| Mistake | Fix |
|---|---|
| `FileURL` element | Use `URL` **or** `FileName` + `FilePath` |
| `ResourceReference` = `1` / `SR1` | Must start with `A` |
| `PLine`/`CLine` on `Release` | Put them inside `ReleaseDetailsByTerritory` |
| Contributors as RDBT siblings | Nest under `ResourceGroup` |
| `LanguageOfPerformance` on instrumental | Omit when `IsInstrumental=true` |
| Wrong RDBT/SDBT child order | Follow XSD sequence (see guides) |
| Absolute paths in package | Relative to BatchComplete / message |
| BatchComplete first on FTP | Transfer BatchComplete **last** |
| Text-mode FTP | Use **binary** or hashes fail |
| Assuming XSD ⇒ DSP OK | Partners add overlays (genres, roles, profiles) |
