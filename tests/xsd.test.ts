import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveErn382Xsd, validateErn382Xml } from '../src/validate/xsd.js'
import { loadAvsEnums } from '../src/knowledge/avs-parse.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixture = path.join(root, 'tests', 'fixtures', 'sample-new-release.xml')

describe('xsd + avs', () => {
  it('resolves vendored XSD', () => {
    const p = resolveErn382Xsd()
    assert.ok(p, 'release-notification.xsd should be under vendor/ddex/ern-382')
  })

  it('parses AVS ParentalWarningType', () => {
    const map = loadAvsEnums()
    assert.ok(map.size > 50, `expected many AVS types, got ${map.size}`)
    const pw = map.get('ParentalWarningType')
    assert.ok(pw)
    assert.ok(pw!.values.includes('Explicit'))
    assert.ok(pw!.values.includes('NotExplicit'))
  })

  it('full-validates sample fixture (or reports engine skip honestly)', async () => {
    const xml = await readFile(fixture, 'utf8')
    const result = await validateErn382Xml(xml)
    if (result.skipped) {
      // Environment without working XSD engine - must fail closed, not pretend valid
      assert.equal(result.valid, false)
      assert.ok(result.skipReason)
      return
    }
    assert.equal(
      result.valid,
      true,
      result.findings.map((f) => f.message).join('\n'),
    )
  })
})
