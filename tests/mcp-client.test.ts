import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixture = path.join(root, 'tests', 'fixtures', 'sample-new-release.xml')

describe('stdio MCP', () => {
  it('lists tools and validates the sample fixture', async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.join(root, 'dist', 'index.js')],
      cwd: root,
      stderr: 'pipe',
    })
    const client = new Client({ name: 'ddex-ern-382-test', version: '0.0.0' })
    await client.connect(transport)
    try {
      const listed = await client.listTools()
      const names = listed.tools.map((t) => t.name).sort()
      for (const required of [
        'validate_ern_xml',
        'validate_package_dir',
        'explain_element',
        'element_sequence',
        'avs_values',
        'howto_compose',
      ]) {
        assert.ok(names.includes(required), `missing tool ${required}`)
      }

      const seq = await client.callTool({
        name: 'element_sequence',
        arguments: { parent: 'DealTerms' },
      })
      const seqText = textOf(seq)
      assert.match(seqText, /DistributionChannel/)
      const dist = seqText.indexOf('DistributionChannel')
      const validity = seqText.indexOf('ValidityPeriod')
      assert.ok(dist > 0 && validity > dist, 'DistributionChannel must be documented before ValidityPeriod')

      const file = await client.callTool({
        name: 'explain_element',
        arguments: { name: 'File' },
      })
      assert.match(textOf(file), /FileURL/)
      assert.match(textOf(file), /FileSize/)

      const validated = await client.callTool({
        name: 'validate_ern_xml',
        arguments: { path: fixture },
      })
      const body = JSON.parse(textOf(validated)) as { valid: boolean; summary: string; findings?: unknown[] }
      assert.equal(body.valid, true, JSON.stringify(body.findings ?? body, null, 2).slice(0, 2000))

      const broken = await client.callTool({
        name: 'validate_ern_xml',
        arguments: {
          xml: `<?xml version="1.0"?><ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382" MessageSchemaVersionId="ern/41"><MessageHeader/></ern:NewReleaseMessage>`,
          smoke_only: true,
        },
      })
      const brokenBody = JSON.parse(textOf(broken)) as { valid: boolean }
      assert.equal(brokenBody.valid, false)
    } finally {
      await client.close()
    }
  })
})

function textOf(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? [])
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text)
    .join('\n')
}
