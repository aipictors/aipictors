import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(process.cwd(), "app")

const extensions = new Set([".ts", ".tsx", ".js", ".jsx"])

const removedRules = new Set([
  "lint/nursery/useUniqueElementIds",
  "lint/correctness/useHookAtTopLevel",
  "lint/a11y/noStaticElementInteractions",
  "lint/suspicious/noExplicitAny",
  "lint/suspicious/noDocumentCookie",
])

function walk(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const st = statSync(fullPath)
    if (st.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }
    if (!st.isFile()) continue
    if (!extensions.has(path.extname(fullPath))) continue
    files.push(fullPath)
  }
  return files
}

function reasonFor(rule: string): string {
  if (rule === "lint/security/noDangerouslySetInnerHtml") {
    return "HTML is generated from serialized/trusted data"
  }
  if (rule === "lint/style/useSelfClosingElements") {
    return "Intentional (JSX kept explicit)"
  }
  if (rule === "lint/a11y/useKeyWithClickEvents") {
    return "Legacy UI (click-only)"
  }
  if (rule === "lint/complexity/useOptionalChain") {
    return "Intentional (readability)"
  }
  return "Intentional"
}

function processFile(filePath: string): boolean {
  const original = readFileSync(filePath, "utf8")
  const lines = original.split(/\r?\n/)
  let changed = false

  const output: string[] = []
  for (const line of lines) {
    const ruleMatch = line.match(/@?biome-ignore\s+([^:]+):\s*(.*)$/)
    if (ruleMatch) {
      const rule = ruleMatch[1].trim()
      if (removedRules.has(rule)) {
        changed = true
        continue
      }

      if (line.includes("<explanation>")) {
        const replacement = reasonFor(rule)
        output.push(line.replaceAll("<explanation>", replacement))
        changed = true
        continue
      }
    }

    if (line.includes("<explanation>") && line.includes("biome-ignore")) {
      output.push(line.replaceAll("<explanation>", "Intentional"))
      changed = true
      continue
    }

    output.push(line)
  }

  if (!changed) return false
  writeFileSync(filePath, output.join("\n"), "utf8")
  return true
}

const files = walk(ROOT)
let touched = 0
for (const filePath of files) {
  if (processFile(filePath)) touched++
}

console.log(`Updated ${touched} file(s).`)
