import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateXML } from 'xsd-schema-validator'
import { smokeValidateErn382Xml, type SmokeIssue } from './smoke.js'

export type XsdSeverity = 'error' | 'warning'

export interface XsdFinding {
  severity: XsdSeverity
  line?: number
  column?: number
  message: string
}

export interface ValidationResult {
  /** True only when smoke + full schema passed with no errors. */
  valid: boolean
  /** Set when the full XSD check could not run (schema missing / engine down). */
  skipped?: boolean
  skipReason?: string
  smokeIssues: SmokeIssue[]
  findings: XsdFinding[]
  checkedAt: string
  schemaPath?: string
}

export function resolveErn382Xsd(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.join(here, '..', '..', 'vendor', 'ddex', 'ern-382', 'release-notification.xsd'),
    path.join(process.cwd(), 'vendor', 'ddex', 'ern-382', 'release-notification.xsd'),
  ]
  return candidates.find((p) => existsSync(p)) ?? null
}

export async function validateErn382Xml(xml: string): Promise<ValidationResult> {
  const smokeIssues = smokeValidateErn382Xml(xml)
  const checkedAt = new Date().toISOString()
  const smokeErrors = smokeIssues.filter((i) => i.severity === 'error')

  const xsdPath = resolveErn382Xsd()
  if (!xsdPath) {
    return {
      valid: false,
      skipped: true,
      skipReason: 'Vendored XSD not found under vendor/ddex/ern-382',
      smokeIssues,
      findings: [
        {
          severity: 'error',
          message: 'Full XSD validation could not run - schema file missing',
        },
      ],
      checkedAt,
    }
  }

  try {
    const result = await validateXML(xml, xsdPath)
    const findings = [
      ...smokeErrors.map((i) => ({
        severity: 'error' as const,
        message: `${i.path}: ${i.message}`,
      })),
      ...parseFindings(result.messages ?? [], result.result),
    ]
    const valid =
      result.valid &&
      smokeErrors.length === 0 &&
      !findings.some((f) => f.severity === 'error')
    return { valid, smokeIssues, findings, checkedAt, schemaPath: xsdPath }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (/WITH_ERRORS|\[error\]|cvc-/i.test(message)) {
      return {
        valid: false,
        smokeIssues,
        findings: [
          ...smokeErrors.map((i) => ({
            severity: 'error' as const,
            message: `${i.path}: ${i.message}`,
          })),
          ...parseFindings(message.split('\n'), 'error'),
        ],
        checkedAt,
        schemaPath: xsdPath,
      }
    }
    const reason = `XSD engine failed: ${message.slice(0, 200)}`
    return {
      valid: false,
      skipped: true,
      skipReason: reason,
      smokeIssues,
      findings: [{ severity: 'error', message: reason }],
      checkedAt,
      schemaPath: xsdPath,
    }
  }
}

export async function validateErn382File(filePath: string): Promise<ValidationResult> {
  const xml = await readFile(filePath, 'utf8')
  return validateErn382Xml(xml)
}

function parseFindings(messages: string[], rawResult: string): XsdFinding[] {
  const source =
    messages.length > 0
      ? messages.map((m) => String(m))
      : String(rawResult ?? '')
          .split('\n')
          .filter((l) => l.trim())

  const findings: XsdFinding[] = []
  for (const line of source) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^OK$/i.test(trimmed)) continue

    const severity: XsdSeverity = /cvc-|WITH_ERRORS|\[error\]/i.test(trimmed)
      ? 'error'
      : 'warning'

    const pos = trimmed.match(/\((\d+):(\d+)\)/)
    findings.push({
      severity,
      line: pos ? Number(pos[1]) : undefined,
      column: pos ? Number(pos[2]) : undefined,
      message: trimmed,
    })
  }
  return findings
}

export function summarizeValidation(result: ValidationResult): string {
  if (result.skipped) return `XSD skipped: ${result.skipReason}`
  if (!result.valid) {
    const first = result.findings[0]?.message ?? 'schema violations'
    return `Invalid ERN 3.8.2 - ${first}`
  }
  return 'Valid ERN 3.8.2 (smoke + XSD)'
}