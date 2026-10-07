import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  explainElement,
  getAvsEnum,
  getEnum,
  getHowto,
  getSequence,
  listElements,
  listEnumIds,
  listHowtos,
  listSequences,
  searchAvsEnums,
} from './knowledge/index.js'
import {
  summarizeValidation,
  validateErn382File,
  validateErn382Xml,
  validatePackageDir,
} from './validate/index.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

function text(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  }
}

function resourcesRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.join(here, '..', 'resources'),
    path.join(process.cwd(), 'resources'),
  ]
  return candidates.find((p) => existsSync(p)) ?? candidates[0]
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'ddex-ern-382',
    version: '0.1.0',
  })

  server.tool(
    'validate_ern_xml',
    'Validate a finished DDEX ERN 3.8.2 NewReleaseMessage (smoke structure/order + full offline XSD). Pass xml string and/or path.',
    {
      xml: z.string().optional().describe('Raw ERN XML string'),
      path: z.string().optional().describe('Absolute or relative path to an .xml file'),
      smoke_only: z
        .boolean()
        .optional()
        .describe('If true, skip full XSD and return smoke issues only'),
    },
    async ({ xml, path: filePath, smoke_only }) => {
      if (!xml && !filePath) {
        return text({
          error: 'Provide xml and/or path',
        })
      }
      let source = xml
      if (!source && filePath) {
        source = await readFile(filePath, 'utf8')
      }
      if (smoke_only) {
        const { smokeValidateErn382Xml } = await import('./validate/smoke.js')
        const smokeIssues = smokeValidateErn382Xml(source!)
        const errors = smokeIssues.filter((i) => i.severity === 'error')
        return text({
          valid: errors.length === 0,
          smokeIssues,
          mode: 'smoke_only',
        })
      }
      const result = filePath && !xml
        ? await validateErn382File(filePath)
        : await validateErn382Xml(source!)
      return text({
        summary: summarizeValidation(result),
        ...result,
      })
    },
  )

  server.tool(
    'validate_package_dir',
    'Validate a DDEX package directory: BatchComplete filled, relative URL, DeliveryType, MD5 of message file.',
    {
      path: z.string().describe('Path to the package directory containing BatchComplete'),
    },
    async ({ path: dir }) => {
      const result = await validatePackageDir(dir)
      return text(result)
    },
  )

  server.tool(
    'explain_element',
    'Explain an ERN 3.8.2 element, attribute, or concept (where it goes, spelling, related items).',
    {
      name: z
        .string()
        .describe('Element/attribute name, e.g. ReleaseDetailsByTerritory, ICPN, FileURL'),
    },
    async ({ name }) => {
      const card = explainElement(name)
      if (!card) {
        const suggestions = listElements()
          .filter((e) => e.name.toLowerCase().includes(name.toLowerCase()))
          .slice(0, 10)
        return text({
          found: false,
          message: `No knowledge card for "${name}"`,
          suggestions,
          hint: 'Try element_sequence for container order, or list_enums / avs_values for allowed values.',
        })
      }
      return text({ found: true, element: card })
    },
  )

  server.tool(
    'element_sequence',
    'Return the canonical child element order (XSD sequence / practice) for a container such as ReleaseDetailsByTerritory or SoundRecording.',
    {
      parent: z
        .string()
        .describe(
          'Parent element name, e.g. ReleaseDetailsByTerritory, SoundRecordingDetailsByTerritory, DealTerms',
        ),
    },
    async ({ parent }) => {
      const seq = getSequence(parent)
      if (!seq) {
        return text({
          found: false,
          message: `No sequence for "${parent}"`,
          available: listSequences(),
        })
      }
      return text({
        found: true,
        id: seq.id,
        parent: seq.parent,
        title: seq.title,
        description: seq.description,
        order: seq.members.map((m) => ({
          name: m.name,
          optional: m.optional,
          choiceWith: m.choiceWith,
          notes: m.notes,
        })),
        smokeOrder: seq.smokeOrder,
      })
    },
  )

  server.tool(
    'list_sequences',
    'List all documented ERN 3.8.2 element sequences available via element_sequence.',
    {},
    async () => text({ sequences: listSequences() }),
  )

  server.tool(
    'list_enums',
    'List curated enum sets (AVS subsets + package-practice values like DeliveryType).',
    {},
    async () => text({ enums: listEnumIds() }),
  )

  server.tool(
    'avs_values',
    'Return allowed values for an AVS simpleType (from vendored avs.xsd) or a curated enum id.',
    {
      name: z
        .string()
        .describe('AVS type or curated id, e.g. ParentalWarningType, ArtistRole, DeliveryType'),
      query: z
        .string()
        .optional()
        .describe('Optional search across AVS type names / values when exact name is unknown'),
      limit: z.number().int().positive().max(500).optional(),
    },
    async ({ name, query, limit }) => {
      if (query) {
        return text({
          mode: 'search',
          results: searchAvsEnums(query, limit ?? 30).map((e) => ({
            name: e.name,
            documentation: e.documentation,
            values: e.values.slice(0, 40),
            valueCount: e.values.length,
          })),
        })
      }
      const curated = getEnum(name)
      const avs = getAvsEnum(name)
      if (!curated && !avs) {
        const fuzzy = searchAvsEnums(name, limit ?? 15)
        return text({
          found: false,
          message: `No enum "${name}"`,
          suggestions: fuzzy.map((e) => e.name),
          curatedIds: listEnumIds().map((e) => e.id),
        })
      }
      return text({
        found: true,
        curated: curated ?? null,
        avs: avs
          ? {
              name: avs.name,
              documentation: avs.documentation,
              values: avs.values.slice(0, limit ?? 200),
              valueCount: avs.values.length,
            }
          : null,
      })
    },
  )

  server.tool(
    'howto_compose',
    'Step-by-step guide for composing ERN 3.8.2 content (new release, vocal vs instrumental, redelivery, takedown, explicit/lyrics, preorder).',
    {
      topic: z
        .string()
        .describe(
          'Guide id or free text: new-release-audio, vocal-vs-instrumental, redelivery, takedown, explicit-lyrics, preorder-deal',
        ),
    },
    async ({ topic }) => {
      const guide = getHowto(topic)
      if (!guide) {
        return text({
          found: false,
          message: `No howto for "${topic}"`,
          available: listHowtos(),
        })
      }
      return text({ found: true, guide })
    },
  )

  server.tool(
    'list_howtos',
    'List available composition howto guides.',
    {},
    async () => text({ howtos: listHowtos() }),
  )

  server.tool(
    'list_elements',
    'List knowledge cards available via explain_element.',
    {},
    async () => text({ elements: listElements() }),
  )

  // Resources - markdown guides
  const root = resourcesRoot()
  const guideFiles = [
    ['ern-382-overview', 'ERN 3.8.2 overview'],
    ['rdbt-order', 'ReleaseDetailsByTerritory order'],
    ['sdbt-order', 'SoundRecordingDetailsByTerritory order'],
    ['batchcomplete', 'BatchComplete package rules'],
    ['common-pitfalls', 'Common ERN 3.8.2 pitfalls'],
  ] as const

  for (const [id, name] of guideFiles) {
    const uri = `ddex-ern-382://guides/${id}`
    const file = path.join(root, `${id}.md`)
    server.resource(id, uri, { mimeType: 'text/markdown', description: name }, async () => {
      if (!existsSync(file)) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: `# ${name}\n\nGuide file missing at ${file}.`,
            },
          ],
        }
      }
      const body = await readFile(file, 'utf8')
      return {
        contents: [{ uri, mimeType: 'text/markdown', text: body }],
      }
    })
  }

  return server
}