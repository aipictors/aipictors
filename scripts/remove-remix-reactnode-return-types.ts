/**
 * Remix route modules may export loader/action functions.
 * A previous codemod added `: React.ReactNode` to exported functions in TSX,
 * which breaks Remix types (loader/action return types must be Promise-based / Response-like).
 *
 * This script removes `: React.ReactNode` / `: ReactNode` return type annotations
 * from exported Remix functions in route modules and entry.
 */

import { writeFile } from "node:fs/promises"

const ROOT = process.cwd()

type FixStats = {
  filesScanned: number
  filesChanged: number
  editsApplied: number
}

const stats: FixStats = {
  filesScanned: 0,
  filesChanged: 0,
  editsApplied: 0,
}

const TARGET_FUNCTION_NAMES = ["loader", "action", "meta", "headers", "handle"]

function stripReactNodeReturnTypes(source: string): {
  out: string
  applied: number
} {
  let applied = 0
  let out = source

  // Function declarations: export (async)? function loader(...) : React.ReactNode {
  // Keep formatting around the function name/params as much as possible.
  const funcDecl = new RegExp(
    String.raw`export\s+(async\s+)?function\s+(${TARGET_FUNCTION_NAMES.join(
      "|",
    )})\s*\(([^)]*)\)\s*:\s*(?:React\.)?ReactNode\s*\{`,
    "g",
  )

  out = out.replace(funcDecl, (_m, asyncPart, name, params) => {
    applied += 1
    const asyncToken = asyncPart ?? ""
    return `export ${asyncToken}function ${name}(${params}) {`
  })

  // Also handle React.ReactNode
  const funcDeclReactDot = new RegExp(
    String.raw`export\s+(async\s+)?function\s+(${TARGET_FUNCTION_NAMES.join(
      "|",
    )})\s*\(([^)]*)\)\s*:\s*React\.ReactNode\s*\{`,
    "g",
  )
  out = out.replace(funcDeclReactDot, (_m, asyncPart, name, params) => {
    applied += 1
    const asyncToken = asyncPart ?? ""
    return `export ${asyncToken}function ${name}(${params}) {`
  })

  // Arrow exports: export const loader = async (...) : React.ReactNode => {
  const arrow = new RegExp(
    String.raw`export\s+const\s+(${TARGET_FUNCTION_NAMES.join(
      "|",
    )})\s*=\s*(async\s*)?\(([^)]*)\)\s*:\s*(?:React\.)?ReactNode\s*=>`,
    "g",
  )
  out = out.replace(arrow, (_m, name, asyncPart, params) => {
    applied += 1
    const asyncToken = asyncPart ?? ""
    return `export const ${name} = ${asyncToken}(${params}) =>`
  })

  const arrowReactDot = new RegExp(
    String.raw`export\s+const\s+(${TARGET_FUNCTION_NAMES.join(
      "|",
    )})\s*=\s*(async\s*)?\(([^)]*)\)\s*:\s*React\.ReactNode\s*=>`,
    "g",
  )
  out = out.replace(arrowReactDot, (_m, name, asyncPart, params) => {
    applied += 1
    const asyncToken = asyncPart ?? ""
    return `export const ${name} = ${asyncToken}(${params}) =>`
  })

  return { out, applied }
}

async function main() {
  const patterns = ["app/routes/**/route.tsx", "app/entry.*.tsx"]

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern)
    for await (const relativePath of glob.scan({
      cwd: ROOT,
      onlyFiles: true,
    })) {
      stats.filesScanned += 1

      const file = Bun.file(relativePath)
      const original = await file.text()
      const r = stripReactNodeReturnTypes(original)

      if (r.out !== original) {
        stats.filesChanged += 1
        stats.editsApplied += r.applied
        await writeFile(relativePath, r.out, "utf8")
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(stats, null, 2))
}

await main()
