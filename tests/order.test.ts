import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  checkSequence,
  directChildNames,
  eachBlock,
  smokeValidateErn382Xml,
} from '../src/validate/smoke.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixture = path.join(root, 'tests', 'fixtures', 'sample-new-release.xml')

describe('direct children', () => {
  it('does not treat nested Title as an RDBT sibling', async () => {
    const xml = await readFile(fixture, 'utf8')
    const rdbt = eachBlock(xml, 'ReleaseDetailsByTerritory')
    assert.ok(rdbt.length >= 1)
    const kids = directChildNames(rdbt[0])
    assert.ok(kids.includes('Title'))
    assert.ok(kids.includes('DisplayArtist'))
    // TitleText lives inside Title, not as an RDBT child
    assert.equal(kids.includes('TitleText'), false)
    assert.equal(kids.includes('FullName'), false)
  })

  it('flags swapped RDBT children and ignores a nested same-name tag', () => {
    const xml = `<ReleaseDetailsByTerritory>
      <LabelName>L</LabelName>
      <DisplayArtistName>A</DisplayArtistName>
      <DisplayArtist><Title>nested</Title></DisplayArtist>
    </ReleaseDetailsByTerritory>`
    const issues = checkSequence(xml, 'ReleaseDetailsByTerritory', [
      'DisplayArtistName',
      'LabelName',
      'DisplayArtist',
    ])
    assert.equal(issues.length, 1)
    assert.match(issues[0].message, /DisplayArtistName/)
  })

  it('sample fixture has no order errors', async () => {
    const xml = await readFile(fixture, 'utf8')
    const issues = smokeValidateErn382Xml(xml).filter((i) => i.severity === 'error')
    assert.deepEqual(issues, [])
  })
})
