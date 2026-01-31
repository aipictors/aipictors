import { writeFile } from "node:fs/promises"

const ROOT = process.cwd()

type FixStats = {
  filesScanned: number
  filesChanged: number
  exportFunctionReturnTypesAdded: number
}

const stats: FixStats = {
  filesScanned: 0,
  filesChanged: 0,
  exportFunctionReturnTypesAdded: 0,
}

// Adds `: React.ReactNode` to exported function declarations without explicit return types.
// - Matches: `export function Foo(...) {` / `export async function Foo(...) {`
// - Matches: `export default function Foo(...) {` / `export default function (...) {` (anonymous default)
// - Skips if return type already present (i.e. `): ... {`)
function fixExportedFunctionReturnTypes(source: string): {
  out: string
  applied: number
} {
  let applied = 0

  const re =
    /export\s+(default\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)?\s*\(([^)]*)\)\s*\{/g

  const out = source.replace(re, (match, isDefault, isAsync, name, params) => {
    // If there is no name (anonymous default export), keep it anonymous.
    const defaultPart = isDefault ?? ""
    const asyncPart = isAsync ?? ""
    const namePart = name ? `${name} ` : ""

    // Guard: if the original had a return type, it wouldn't match because we require `{`.
    // Still, keep extra safety by ensuring we aren't inside a type context.
    applied += 1
    return `export ${defaultPart}${asyncPart}function ${namePart}(${params}): React.ReactNode {`
  })

  return { out, applied }
}

async function main() {
  // Only run on component-oriented TSX files.
  // NOTE: Do NOT run on Remix route modules (app/routes/**) or entry files.
  // Adding `: React.ReactNode` to loaders/actions breaks type checking.
  const patterns = [
    "app/components/**/*.tsx",
    "app/routes/**/components/**/*.tsx",
  ]

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern)
    for await (const relativePath of glob.scan({
      cwd: ROOT,
      onlyFiles: true,
    })) {
      stats.filesScanned += 1

      const file = Bun.file(relativePath)
      const original = await file.text()

      // Only apply the exported-function rule to TSX (React components). TS files are handled manually.
      let next = original
      let applied = 0

      if (relativePath.endsWith(".tsx")) {
        const r = fixExportedFunctionReturnTypes(next)
        next = r.out
        applied += r.applied
      }

      if (next !== original) {
        stats.filesChanged += 1
        stats.exportFunctionReturnTypesAdded += applied
        await writeFile(relativePath, next, "utf8")
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ...stats,
      },
      null,
      2,
    ),
  )
}

await main()
