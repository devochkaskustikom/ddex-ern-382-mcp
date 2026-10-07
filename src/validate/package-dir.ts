import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

export type PackageIssue = {
  severity: 'error' | 'warning'
  path: string
  message: string
}

export type PackageValidationResult = {
  valid: boolean
  issues: PackageIssue[]
  deliveryType?: string
  messageUrl?: string
  checkedAt: string
}

/**
 * Lightweight package-directory checks (BatchComplete practice).
 * Vendor-agnostic: filled BatchComplete, relative URL, DeliveryType, MD5.
 */

export async function validatePackageDir(
  dir: string,
): Promise<PackageValidationResult> {
  const issues: PackageIssue[] = []
  const checkedAt = new Date().toISOString()

  if (!existsSync(dir)) {
    return {
      valid: false,
      issues: [{ severity: 'error', path: dir, message: 'Directory does not exist' }],
      checkedAt,
    }
  }

  const batchPath = await findBatchComplete(dir)
  if (!batchPath) {
    issues.push({
      severity: 'error',
      path: dir,
      message: 'BatchComplete file not found (expected BatchComplete or BatchComplete.xml)',
    })
    return { valid: false, issues, checkedAt }
  }

  const batchXml = await readFile(batchPath, 'utf8')
  if (!batchXml.trim() || !/<MessageInBatch>/.test(batchXml)) {
    issues.push({
      severity: 'error',
      path: batchPath,
      message: 'BatchComplete must be filled with MessageInBatch (blank manifests rejected)',
    })
  }

  const deliveryType = /<DeliveryType>([^<]+)<\/DeliveryType>/.exec(batchXml)?.[1]
  if (!deliveryType) {
    issues.push({
      severity: 'error',
      path: batchPath,
      message: 'DeliveryType missing',
    })
  } else if (
    !['NewReleaseDelivery', 'ReDelivery', 'TakeDown'].includes(deliveryType)
  ) {
    issues.push({
      severity: 'error',
      path: batchPath,
      message: `Unknown DeliveryType "${deliveryType}"`,
    })
  }

  const messageUrl = /<URL>([^<]+)<\/URL>/.exec(batchXml)?.[1]
  if (!messageUrl) {
    issues.push({ severity: 'error', path: batchPath, message: 'Message URL missing' })
  } else if (/^(?:[a-zA-Z]:[\\/]|\/|https?:)/.test(messageUrl)) {
    issues.push({
      severity: 'error',
      path: batchPath,
      message: `URL should be relative to the package (got "${messageUrl}")`,
    })
  }

  const hash = /<HashSum>\s*<HashSum>([a-fA-F0-9]+)<\/HashSum>/.exec(batchXml)?.[1]
    ?? /<HashSum>([a-fA-F0-9]{32})<\/HashSum>/.exec(batchXml)?.[1]
  const algo = /<HashSumAlgorithmType>([^<]+)<\/HashSumAlgorithmType>/.exec(batchXml)?.[1]

  if (!hash) {
    issues.push({
      severity: 'error',
      path: batchPath,
      message: 'HashSum for the message file is required',
    })
  }
  if (algo && algo !== 'MD5') {
    issues.push({
      severity: 'warning',
      path: batchPath,
      message: `HashSumAlgorithmType is ${algo}; MD5 is the common package practice`,
    })
  }

  if (messageUrl) {
    const rel = messageUrl.replace(/^\.\//, '')
    const abs = path.resolve(path.dirname(batchPath), rel)
    if (!existsSync(abs)) {
      // Also try relative to package root
      const abs2 = path.resolve(dir, rel)
      if (!existsSync(abs2)) {
        issues.push({
          severity: 'error',
          path: messageUrl,
          message: `Referenced message file not found at ${abs} or ${abs2}`,
        })
      } else if (hash) {
        await assertMd5(abs2, hash, issues, messageUrl)
      }
    } else if (hash) {
      await assertMd5(abs, hash, issues, messageUrl)
    }
  }

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
    deliveryType,
    messageUrl,
    checkedAt,
  }
}

async function assertMd5(
  filePath: string,
  expected: string,
  issues: PackageIssue[],
  label: string,
) {
  const buf = await readFile(filePath)
  const actual = createHash('md5').update(buf).digest('hex')
  if (actual.toLowerCase() !== expected.toLowerCase()) {
    issues.push({
      severity: 'error',
      path: label,
      message: `MD5 mismatch: BatchComplete has ${expected}, file is ${actual}`,
    })
  }
}

async function findBatchComplete(dir: string): Promise<string | null> {
  const names = ['BatchComplete', 'BatchComplete.xml', 'batch_complete.xml']
  for (const n of names) {
    const p = path.join(dir, n)
    if (existsSync(p)) {
      const s = await stat(p)
      if (s.isFile()) return p
    }
  }
  // shallow search
  const entries = await readdir(dir)
  const hit = entries.find((e) => /^batchcomplete(\.xml)?$/i.test(e))
  return hit ? path.join(dir, hit) : null
}