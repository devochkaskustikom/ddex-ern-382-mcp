import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type AvsEnum = {
  name: string
  documentation?: string
  values: string[]
}

function resolveAvsPath(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.join(here, '..', '..', 'vendor', 'ddex', 'avs', 'avs.xsd'),
    path.join(process.cwd(), 'vendor', 'ddex', 'avs', 'avs.xsd'),
  ]
  return candidates.find((p) => existsSync(p)) ?? null
}

let cache: Map<string, AvsEnum> | null = null

/**
 * Lightweight parse of avs.xsd simpleTypes → enumeration values.
 * Not a full XSD processor; enough for list_enums / avs_values.
 */

export function loadAvsEnums(): Map<string, AvsEnum> {
  if (cache) return cache
  const file = resolveAvsPath()
  const map = new Map<string, AvsEnum>()
  if (!file) {
    cache = map
    return map
  }
  const xml = readFileSync(file, 'utf8')
  const typeRe =
    /<xs:simpleType\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/xs:simpleType>/g
  let m: RegExpExecArray | null
  while ((m = typeRe.exec(xml))) {
    const name = m[1]
    const body = m[2]
    const doc =
      /<xs:documentation[^>]*>([\s\S]*?)<\/xs:documentation>/.exec(body)?.[1]
        ?.replace(/\s+/g, ' ')
        .trim() ?? undefined
    const values: string[] = []
    const enumRe = /<xs:enumeration\s+value="([^"]+)"/g
    let e: RegExpExecArray | null
    while ((e = enumRe.exec(body))) values.push(e[1])
    if (values.length > 0) {
      map.set(name, { name, documentation: doc, values })
    }
  }
  cache = map
  return map
}

export function getAvsEnum(name: string): AvsEnum | undefined {
  const map = loadAvsEnums()
  if (map.has(name)) return map.get(name)
  const lower = name.toLowerCase()
  for (const [k, v] of map) {
    if (k.toLowerCase() === lower) return v
  }
  return undefined
}

export function searchAvsEnums(query: string, limit = 30): AvsEnum[] {
  const map = loadAvsEnums()
  const q = query.trim().toLowerCase()
  if (!q) {
    return [...map.values()].slice(0, limit)
  }
  const out: AvsEnum[] = []
  for (const v of map.values()) {
    if (
      v.name.toLowerCase().includes(q) ||
      v.values.some((x) => x.toLowerCase() === q || x.toLowerCase().includes(q))
    ) {
      out.push(v)
      if (out.length >= limit) break
    }
  }
  return out
}