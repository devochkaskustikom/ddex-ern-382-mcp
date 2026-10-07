import { SEQUENCES } from '../knowledge/sequences.js'

export type SmokeSeverity = 'error' | 'warning'

export type SmokeIssue = {
  path: string
  message: string
  severity: SmokeSeverity
}

/**
 * Fast structural checks for ERN 3.8.2 NewReleaseMessage XML.
 * Does not replace full XSD validation.
 *
 * Hard errors are only things that are always wrong (wrong schema id, FileURL,
 * ResourceReference not matching A[...], direct-child order violations).
 * Partner/practice rules (shops, PLine, LanguageAndScriptCode) are warnings so
 * a schema-valid message is not rejected before XSD.
 */
export function smokeValidateErn382Xml(xml: string): SmokeIssue[] {
  const issues: SmokeIssue[] = []
  const missing = (
    re: RegExp,
    path: string,
    message: string,
    severity: SmokeSeverity = 'error',
  ) => {
    if (!re.test(xml)) issues.push({ path, message, severity })
  }

  missing(
    /MessageSchemaVersionId="ern\/382"/,
    'NewReleaseMessage',
    'MessageSchemaVersionId must be ern/382',
  )
  missing(
    /xmlns(?::[\w.-]+)?="http:\/\/ddex\.net\/xml\/ern\/382"/,
    'NewReleaseMessage',
    'Missing ern/382 namespace',
  )
  missing(/<MessageHeader[\s>]/, 'MessageHeader', 'MessageHeader required')
  missing(/<ResourceList[\s>]/, 'ResourceList', 'ResourceList required')
  missing(/<ReleaseList[\s>]/, 'ReleaseList', 'ReleaseList required')
  missing(
    /<DealList[\s>]/,
    'DealList',
    'DealList is optional in the XSD but required by commercial delivery practice',
    'warning',
  )
  missing(
    /<SoundRecording[\s>]/,
    'SoundRecording',
    'No SoundRecording found (audio packages need at least one)',
    'warning',
  )
  missing(
    /<ICPN[\s>]/,
    'ReleaseId/ICPN',
    'ICPN not found (common for audio products; GRid-only releases are schema-legal)',
    'warning',
  )
  missing(
    /<DistributionChannel[\s>]/,
    'DealTerms/DistributionChannel',
    'No DistributionChannel (shop) - many DSPs require at least one',
    'warning',
  )
  missing(/<PLine[\s>]/, 'PLine', 'PLine not found (rights line expected by most partners)', 'warning')
  missing(/<CLine[\s>]/, 'CLine', 'CLine not found (rights line expected by most partners)', 'warning')
  missing(
    /LanguageAndScriptCode="/,
    'LanguageAndScriptCode',
    'LanguageAndScriptCode should appear on message/titles/parties',
    'warning',
  )

  for (const m of xml.matchAll(/<Duration>([^<]*)<\/Duration>/g)) {
    if (!/^PT(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?$/.test(m[1].trim())) {
      issues.push({
        path: 'Duration',
        severity: 'error',
        message: `Duration "${m[1]}" is not ISO-8601 PT#H#M#S`,
      })
    }
  }

  for (const m of xml.matchAll(/<ResourceReference>([^<]*)<\/ResourceReference>/g)) {
    if (!/^A[\d\-_a-zA-Z]+$/.test(m[1].trim())) {
      issues.push({
        path: 'ResourceReference',
        severity: 'error',
        message: `ResourceReference "${m[1]}" must match A[\\d\\-_a-zA-Z]+`,
      })
    }
  }

  if (/<FileURL[\s>]/.test(xml)) {
    issues.push({
      path: 'File/FileURL',
      severity: 'error',
      message: 'FileURL does not exist in ERN 3.8.2 - use URL or FileName+FilePath',
    })
  }

  for (const seq of [
    SEQUENCES.ReleaseDetailsByTerritory,
    SEQUENCES.SoundRecordingDetailsByTerritory,
    SEQUENCES.SoundRecording,
    SEQUENCES.Release,
    SEQUENCES.DealTerms,
    SEQUENCES.MessageHeader,
  ]) {
    issues.push(...checkSequence(xml, seq.parent, seq.smokeOrder))
  }

  return issues
}

type Tok = { kind: 'open' | 'close'; name: string; index: number }

function tokenize(xml: string): Tok[] {
  const out: Tok[] = []
  const re = /<(\/?)([A-Za-z][\w.-]*)([^>]*?)(\/?)>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    const closing = m[1] === '/'
    const selfClose = m[4] === '/'
    const name = m[2]
    if (closing) out.push({ kind: 'close', name, index: m.index })
    else {
      out.push({ kind: 'open', name, index: m.index })
      if (selfClose) out.push({ kind: 'close', name, index: m.index })
    }
  }
  return out
}

/** Every occurrence of `tag`, sliced to its matching close, skipping nested same-name tags. */
export function eachBlock(xml: string, tag: string): string[] {
  const toks = tokenize(xml)
  const blocks: string[] = []
  for (let i = 0; i < toks.length; i += 1) {
    const t = toks[i]
    if (t.kind !== 'open' || t.name !== tag) continue
    let depth = 1
    for (let j = i + 1; j < toks.length; j += 1) {
      const u = toks[j]
      if (u.name !== tag) continue
      depth += u.kind === 'open' ? 1 : -1
      if (depth === 0) {
        const closeEnd = xml.indexOf('>', u.index)
        blocks.push(xml.slice(t.index, closeEnd + 1))
        break
      }
    }
  }
  return blocks
}

/** Local names of elements whose parent is the root element of `blockXml`. */
export function directChildNames(blockXml: string): string[] {
  const toks = tokenize(blockXml)
  if (toks.length === 0) return []
  const root = toks[0].name
  const names: string[] = []
  let depth = 0
  for (const t of toks) {
    if (t.kind === 'open') {
      if (depth === 1) names.push(t.name)
      depth += 1
    } else {
      depth -= 1
      if (t.name === root && depth === 0) break
    }
  }
  return names
}

/**
 * Assert direct children of `parentTag` that appear in `order` respect that order.
 * Nested elements with the same local name are ignored.
 */
export function checkSequence(
  xml: string,
  parentTag: string,
  order: readonly string[],
): SmokeIssue[] {
  const problems: SmokeIssue[] = []
  const rank = new Map(order.map((name, i) => [name, i]))
  for (const blockXml of eachBlock(xml, parentTag)) {
    const children = directChildNames(blockXml)
    let last = -1
    let lastName = ''
    for (const child of children) {
      const r = rank.get(child)
      if (r === undefined) continue
      if (r < last) {
        problems.push({
          path: `${parentTag}/${child}`,
          severity: 'error',
          message: `Element order violation: ${child} appears after ${lastName}. XSD sequence expects ${order.filter((n) => children.includes(n)).join(' → ')}`,
        })
      } else {
        last = r
        lastName = child
      }
    }
  }
  return problems
}
