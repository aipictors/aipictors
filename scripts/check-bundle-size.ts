/**
 * バンドルサイズの増加を検知する。`bun remix vite:build` のあとに実行する。
 *
 *   bun run scripts/check-bundle-size.ts            予算（scripts/bundle-budget.json）と比べる。超えたら exit 1
 *   bun run scripts/check-bundle-size.ts --update   今の値に余裕を足して予算を書き直す
 *   bun run scripts/check-bundle-size.ts --top 20   主要ページで読む JS を大きい順に出す
 *   bun run scripts/check-bundle-size.ts --json     結果を JSON で出す
 *
 * ページの JS は、manifest の route（親もたどる）と entry から静的 import をたどった全ファイルの gzip 合計。
 * dynamic import（lazy）の先は含めない。
 */
import { gzipSync } from "node:zlib"
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"

const CLIENT_DIR = "build/client"
const ASSETS_DIR = join(CLIENT_DIR, "assets")
const BUDGET_PATH = "scripts/bundle-budget.json"
// --update のときに今の値へ足す余裕（小さな変更で落ちないように）
const BUDGET_MARGIN = 1.05

const PAGES: Record<string, string> = {
  home: "routes/($lang)._main._index",
  work: "routes/($lang)._main.posts.$post._index",
  generation: "routes/($lang).generation._index",
  tag: "routes/($lang)._main.tags.$tag._index",
  ranking: "routes/($lang)._main.rankings._index",
  search: "routes/($lang)._main.search",
  user: "routes/($lang)._main.users.$user._index",
  newImage: "routes/($lang)._main.new.image",
}

type RouteEntry = {
  id: string
  parentId?: string
  module: string
  imports?: string[]
}

type Manifest = {
  entry: { module: string; imports?: string[] }
  routes: Record<string, RouteEntry>
}

type Budget = {
  pagesGzipKb: Record<string, number>
  pagesFiles: Record<string, number>
  clientMb: number
  clientFiles: number
  largestJsKb: number
}

const readManifest = (): Manifest => {
  const file = readdirSync(ASSETS_DIR).find(
    (name) => name.startsWith("manifest-") && name.endsWith(".js"),
  )
  if (!file) throw new Error("manifest がない。先に bun remix vite:build を実行する")
  const source = readFileSync(join(ASSETS_DIR, file), "utf8")
  const json = source.slice(source.indexOf("{"), source.lastIndexOf("}") + 1)
  return JSON.parse(json)
}

const gzipCache = new Map<string, number>()
const gzipSizeOf = (href: string) => {
  const cached = gzipCache.get(href)
  if (cached !== undefined) return cached
  const size = gzipSync(readFileSync(join(CLIENT_DIR, href))).length
  gzipCache.set(href, size)
  return size
}

const STATIC_IMPORT = /(?:^|[;\s}])(?:import|export)\s*(?:[\w$*{},\s]*?from\s*)?["']\.\/([^"']+\.js)["']/g

/** 静的 import をたどって、そのページの最初に読むファイルをすべて集める */
const collectStaticImports = (starts: string[]) => {
  const seen = new Set<string>()
  const stack = [...starts]
  while (stack.length > 0) {
    const href = stack.pop()
    if (!href || seen.has(href)) continue
    seen.add(href)
    const source = readFileSync(join(CLIENT_DIR, href), "utf8")
    for (const match of source.matchAll(STATIC_IMPORT)) {
      stack.push(`/assets/${match[1]}`)
    }
  }
  return seen
}

const pageFiles = (manifest: Manifest, routeId: string) => {
  const starts = [manifest.entry.module, ...(manifest.entry.imports ?? [])]
  let route: RouteEntry | undefined = manifest.routes[routeId]
  if (!route) throw new Error(`route がない: ${routeId}`)
  while (route) {
    starts.push(route.module, ...(route.imports ?? []))
    route = route.parentId ? manifest.routes[route.parentId] : undefined
  }
  return collectStaticImports(starts)
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

const toKb = (bytes: number) => Math.round(bytes / 1024)

const main = () => {
  const args = process.argv.slice(2)
  if (!existsSync(ASSETS_DIR)) {
    throw new Error("build/client がない。先に bun remix vite:build を実行する")
  }
  const manifest = readManifest()

  const pagesGzipKb: Record<string, number> = {}
  const pagesFiles: Record<string, number> = {}
  const filesByPage: Record<string, Set<string>> = {}
  for (const [page, routeId] of Object.entries(PAGES)) {
    const files = pageFiles(manifest, routeId)
    filesByPage[page] = files
    pagesFiles[page] = files.size
    pagesGzipKb[page] = toKb(
      [...files].reduce((sum, href) => sum + gzipSizeOf(href), 0),
    )
  }

  const clientFilesList = walk(CLIENT_DIR)
  const clientBytes = clientFilesList.reduce(
    (sum, path) => sum + statSync(path).size,
    0,
  )
  const largestJs = clientFilesList
    .filter((path) => path.endsWith(".js"))
    .reduce((max, path) => Math.max(max, statSync(path).size), 0)

  const current: Budget = {
    pagesGzipKb,
    pagesFiles,
    clientMb: Math.round(clientBytes / 1024 / 1024),
    clientFiles: clientFilesList.length,
    largestJsKb: toKb(largestJs),
  }

  if (args.includes("--json")) {
    console.log(JSON.stringify(current, null, 2))
    return
  }

  const topIndex = args.indexOf("--top")
  if (topIndex >= 0) {
    const limit = Number(args[topIndex + 1] ?? 20)
    for (const [page, files] of Object.entries(filesByPage)) {
      console.log(`\n${page}: ${pagesGzipKb[page]}KB (${files.size} files)`)
      const sorted = [...files].sort((a, b) => gzipSizeOf(b) - gzipSizeOf(a))
      for (const href of sorted.slice(0, limit)) {
        console.log(`  ${String(toKb(gzipSizeOf(href))).padStart(5)}KB ${href}`)
      }
    }
    return
  }

  if (args.includes("--update")) {
    const withMargin = (value: number) => Math.ceil(value * BUDGET_MARGIN)
    const mapValues = (record: Record<string, number>) =>
      Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, withMargin(value)]),
      )
    const budget: Budget = {
      pagesGzipKb: mapValues(current.pagesGzipKb),
      pagesFiles: mapValues(current.pagesFiles),
      clientMb: withMargin(current.clientMb),
      clientFiles: withMargin(current.clientFiles),
      largestJsKb: withMargin(current.largestJsKb),
    }
    writeFileSync(BUDGET_PATH, `${JSON.stringify(budget, null, 2)}\n`)
    console.log(`${BUDGET_PATH} を更新した`)
    return
  }

  const budget: Budget = JSON.parse(readFileSync(BUDGET_PATH, "utf8"))
  const errors: string[] = []
  const check = (label: string, value: number, limit: number | undefined) => {
    const over = limit !== undefined && value > limit
    if (over) errors.push(`${label}: ${value} > ${limit}`)
    console.log(
      `${over ? "NG" : "ok"} ${label.padEnd(24)} ${String(value).padStart(6)} / ${limit ?? "-"}`,
    )
  }
  for (const page of Object.keys(PAGES)) {
    check(`${page} JS gzip KB`, pagesGzipKb[page] ?? 0, budget.pagesGzipKb[page])
    check(`${page} JS files`, pagesFiles[page] ?? 0, budget.pagesFiles[page])
  }
  check("build/client MB", current.clientMb, budget.clientMb)
  check("build/client files", current.clientFiles, budget.clientFiles)
  check("largest JS KB", current.largestJsKb, budget.largestJsKb)

  if (errors.length > 0) {
    console.error(`\n予算を超えた:\n${errors.join("\n")}`)
    console.error(
      "意図した増加なら bun run scripts/check-bundle-size.ts --update で予算を更新する",
    )
    process.exit(1)
  }
}

main()
