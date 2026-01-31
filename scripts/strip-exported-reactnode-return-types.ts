/**
 * Reverts a previous codemod that added `: React.ReactNode` return types to
 * exported function declarations in TSX.
 *
 * This is safe for Remix route modules and hooks, where ReactNode return types
 * are often incorrect (e.g. loader/action/hooks returning objects).
 */

import { writeFile } from "node:fs/promises"

const ROOT = process.cwd()

type FixStats = {
  filesScanned: number
  filesChanged: number
  replacements: number
}

const stats: FixStats = {
  filesScanned: 0,
  filesChanged: 0,
  replacements: 0,
}

function stripReactNodeReturnTypeBeforeBlock(source: string): {
  out: string
  applied: number
} {
  let applied = 0

  const patterns: Array<[RegExp, string]> = [
    [/\)\s*:\s*React\.ReactNode\s*\{/g, ") {"],
    [/\)\s*:\s*ReactNode\s*\{/g, ") {"],
  ]

  let out = source
  for (const [re, replacement] of patterns) {
    out = out.replace(re, () => {
      applied += 1
      return replacement
    })
  }

  return { out, applied }
}

async function main() {
  const patterns = ["app/routes/**/*.tsx", "app/entry.*.tsx"]

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern)
    for await (const relativePath of glob.scan({
      cwd: ROOT,
      onlyFiles: true,
    })) {
      stats.filesScanned += 1

      const file = Bun.file(relativePath)
      const original = await file.text()
      const r = stripReactNodeReturnTypeBeforeBlock(original)

      if (r.out !== original) {
        stats.filesChanged += 1
        stats.replacements += r.applied
        await writeFile(relativePath, r.out, "utf8")
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(stats, null, 2))
}

await main()
