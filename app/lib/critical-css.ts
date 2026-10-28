/**
 * ページの HTML で使っているクラスのルールだけを tailwind.css から抜き出して <head> に直接入れ、
 * tailwind.css 本体は描画を止めずに読み込む（media="print" で読み、読み終わったら all に戻す）。
 *
 * tailwind.css はサイト全体のぶん（約 400KB・圧縮 45KB）あり、最初の描画まで回線の遅いスマホで
 * 0.7 秒ほど待たされていた。HTML に出ているクラスのルールは全部入れるので、本体が届いても見た目は変わらない
 * （クラスを含まないルール＝要素・属性・:root などは常に入れる）。
 *
 * hydration で React が要素を突き合わせるので、要素は足さない。
 * root.tsx が出す空の <style data-critical-css> に中身を入れ、<link> は属性だけ書き換える。
 */

type CssNode = {
  /** このルール・ブロックが要求するクラス（どれか 1 組がすべて HTML にあれば入れる）。null は常に入れる */
  classSets: string[][] | null
  /** 子を持たないときの全文 */
  text?: string
  /** @media / @supports / @layer などの前置き（"@media (min-width:768px)"） */
  prelude?: string
  children?: CssNode[]
}

const PLACEHOLDER = "<style data-critical-css=\"\"></style>"

const unescapeCssIdent = (value: string): string =>
  value.replace(/\\([0-9a-fA-F]{1,6}\s?|[\s\S])/g, (_, escaped: string) => {
    if (/^[0-9a-fA-F]{1,6}\s?$/.test(escaped)) {
      return String.fromCodePoint(Number.parseInt(escaped.trim(), 16))
    }
    return escaped
  })

/**
 * セレクタの必須クラス。:not() / :is() / :where() / :has() の中と属性セレクタの中は数えない（多めに入るだけ）
 */
const requiredClasses = (selector: string): string[] => {
  let out = ""
  let depth = 0
  let bracket = 0
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]
    if (ch === "\\") {
      if (depth === 0 && bracket === 0) out += ch + (selector[i + 1] ?? "")
      i++
      continue
    }
    if (ch === "[") {
      bracket++
      continue
    }
    if (ch === "]" && bracket > 0) {
      bracket--
      continue
    }
    if (bracket > 0) continue
    if (ch === "(") {
      depth++
      continue
    }
    if (ch === ")" && depth > 0) {
      depth--
      continue
    }
    if (depth === 0) out += ch
  }
  const classes: string[] = []
  for (const match of out.matchAll(/\.((?:\\[\s\S]|[\w\u0080-￿-])+)/g)) {
    classes.push(unescapeCssIdent(match[1]))
  }
  return classes
}

const toClassSets = (selectorList: string): string[][] | null => {
  // コンマ区切り（括弧・属性セレクタの中のコンマは区切りではない）
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < selectorList.length; i++) {
    const ch = selectorList[i]
    if (ch === "\\") {
      i++
      continue
    }
    if (ch === "(" || ch === "[") depth++
    else if ((ch === ")" || ch === "]") && depth > 0) depth--
    else if (ch === "," && depth === 0) {
      parts.push(selectorList.slice(start, i))
      start = i + 1
    }
  }
  parts.push(selectorList.slice(start))
  const sets = parts.map(requiredClasses)
  // クラスのないセレクタが 1 つでもあれば常に入れる
  if (sets.some((set) => set.length === 0)) return null
  return sets
}

/**
 * ミニファイ済みの CSS を、ルールとブロックの木にする
 */
const parseCss = (css: string): CssNode[] => {
  let i = 0

  const skipString = (quote: string) => {
    i++
    while (i < css.length && css[i] !== quote) {
      if (css[i] === "\\") i++
      i++
    }
    i++
  }

  /** "{" か ";" か "}" まで読む（文字列・コメント・エスケープは飛ばす） */
  const readUntilDelimiter = () => {
    const begin = i
    while (i < css.length) {
      const ch = css[i]
      if (ch === "\\") {
        i += 2
        continue
      }
      if (ch === '"' || ch === "'") {
        skipString(ch)
        continue
      }
      if (ch === "/" && css[i + 1] === "*") {
        const end = css.indexOf("*/", i + 2)
        i = end < 0 ? css.length : end + 2
        continue
      }
      if (ch === "{" || ch === ";" || ch === "}") break
      i++
    }
    return css.slice(begin, i)
  }

  /** "{" の次から対応する "}" の次まで */
  const readBlockBody = () => {
    const begin = i
    let depth = 1
    while (i < css.length && depth > 0) {
      const ch = css[i]
      if (ch === "\\") {
        i += 2
        continue
      }
      if (ch === '"' || ch === "'") {
        skipString(ch)
        continue
      }
      if (ch === "{") depth++
      else if (ch === "}") depth--
      i++
    }
    return css.slice(begin, i - 1)
  }

  const parseList = (): CssNode[] => {
    const nodes: CssNode[] = []
    while (i < css.length) {
      const prelude = readUntilDelimiter()
      const trimmed = prelude.replace(/\/\*[\s\S]*?\*\//g, "").trim()
      const ch = css[i]
      if (ch === "}") {
        i++
        break
      }
      if (ch === ";" || i >= css.length) {
        i++
        if (trimmed) nodes.push({ classSets: null, text: `${trimmed};` })
        continue
      }
      // "{"
      i++
      if (/^@(media|supports|layer|container|scope|document)\b/.test(trimmed)) {
        const children = parseList()
        nodes.push({ classSets: null, prelude: trimmed, children })
        continue
      }
      const body = readBlockBody()
      if (trimmed.startsWith("@")) {
        // @keyframes / @font-face / @property などは常に入れる
        nodes.push({ classSets: null, text: `${trimmed}{${body}}` })
        continue
      }
      nodes.push({ classSets: toClassSets(trimmed), text: `${trimmed}{${body}}` })
    }
    return nodes
  }

  return parseList()
}

const serialize = (nodes: CssNode[], classes: Set<string>): string => {
  let out = ""
  for (const node of nodes) {
    if (node.children) {
      const inner = serialize(node.children, classes)
      if (inner) out += `${node.prelude}{${inner}}`
      continue
    }
    if (
      node.classSets === null ||
      node.classSets.some((set) => set.every((name) => classes.has(name)))
    ) {
      out += node.text
    }
  }
  return out
}

const decodeHtmlAttribute = (value: string): string =>
  value
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")

const collectClasses = (html: string): Set<string> => {
  const classes = new Set<string>()
  for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const name of decodeHtmlAttribute(match[1]).split(/\s+/)) {
      if (name) classes.add(name)
    }
  }
  return classes
}

const parsedCss = new Map<string, Promise<CssNode[] | null>>()

const STYLESHEET_LINK =
  /<link rel="stylesheet" href="(\/assets\/tailwind-[\w-]+\.css)"\/?>/

/**
 * HTML に tailwind.css の必要な部分を入れる。できないときは元の HTML のまま返す
 */
export const inlineCriticalCss = async (
  response: Response,
  fetchAsset: (path: string) => Promise<Response>,
): Promise<Response> => {
  const contentType = response.headers.get("Content-Type") ?? ""
  if (response.status !== 200 || !contentType.includes("text/html")) {
    return response
  }
  const html = await response.text()
  const unchanged = () =>
    new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })

  const link = html.match(STYLESHEET_LINK)
  if (!link || !html.includes(PLACEHOLDER)) return unchanged()

  const href = link[1]
  let nodesPromise = parsedCss.get(href)
  if (!nodesPromise) {
    nodesPromise = fetchAsset(href)
      .then(async (res) => (res.ok ? parseCss(await res.text()) : null))
      .catch(() => null)
    parsedCss.set(href, nodesPromise)
  }
  const nodes = await nodesPromise
  if (!nodes) {
    parsedCss.delete(href)
    return unchanged()
  }

  const critical = serialize(nodes, collectClasses(html)).replaceAll(
    "</style",
    "<\\/style",
  )
  const asyncLink = `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"/>`
  const output = html
    .replace(PLACEHOLDER, `<style data-critical-css="">${critical}</style>`)
    .replace(link[0], asyncLink)

  const headers = new Headers(response.headers)
  headers.delete("Content-Length")
  return new Response(output, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** テスト用 */
export const __test__ = { parseCss, serialize, collectClasses, requiredClasses }
