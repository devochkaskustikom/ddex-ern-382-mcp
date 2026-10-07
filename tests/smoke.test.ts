import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { smokeValidateErn382Xml } from '../src/validate/smoke.js'
import { getSequence, explainElement, getHowto, getEnum } from '../src/knowledge/index.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixture = path.join(root, 'tests', 'fixtures', 'sample-new-release.xml')

describe('knowledge', () => {
  it('exposes RDBT smoke order', () => {
    const seq = getSequence('ReleaseDetailsByTerritory')
    assert.ok(seq)
    assert.equal(seq!.smokeOrder[0], 'TerritoryCode')
    assert.ok(seq!.smokeOrder.includes('CLine'))
  })

  it('explains FileURL pitfall via File card', () => {
    const card = explainElement('File')
    assert.ok(card)
    assert.match(card!.summary + (card!.spelling ?? []).join(' '), /FileURL|URL/)
  })

  it('has new-release howto', () => {
    const g = getHowto('new-release-audio')
    assert.ok(g)
    assert.ok(g!.steps.length >= 5)
  })

  it('lists DeliveryType enum', () => {
    const e = getEnum('DeliveryType')
    assert.ok(e)
    assert.ok(e!.values.some((v) => v.value === 'TakeDown'))
  })
})

describe('smokeValidateErn382Xml', () => {
  it('accepts sample NewReleaseMessage structurally', async () => {
    const xml = await readFile(fixture, 'utf8')
    const issues = smokeValidateErn382Xml(xml)
    assert.equal(
      issues.length,
      0,
      issues.map((i) => `${i.path}: ${i.message}`).join('\n'),
    )
  })

  it('flags wrong schema version', () => {
    const xml = `<?xml version="1.0"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382" MessageSchemaVersionId="ern/41">
  <MessageHeader></MessageHeader>
</ern:NewReleaseMessage>`
    const issues = smokeValidateErn382Xml(xml)
    assert.ok(issues.some((i) => /ern\/382/.test(i.message)))
  })

  it('flags FileURL', () => {
    const xml = `<?xml version="1.0"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382" MessageSchemaVersionId="ern/382" LanguageAndScriptCode="en">
  <MessageHeader></MessageHeader>
  <ResourceList><SoundRecording></SoundRecording></ResourceList>
  <ReleaseList><Release><ReleaseId><ICPN>1</ICPN></ReleaseId></Release></ReleaseList>
  <DealList><DistributionChannel></DistributionChannel></DealList>
  <PLine></PLine><CLine></CLine>
  <Duration>PT1M</Duration>
  <FileURL>http://example</FileURL>
</ern:NewReleaseMessage>`
    const issues = smokeValidateErn382Xml(xml)
    assert.ok(issues.some((i) => /FileURL/.test(i.message)))
  })
})
