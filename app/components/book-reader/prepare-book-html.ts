/**
 * 小説・コラムの本文（tiptap が出した HTML）を、本のように読む画面（book-reader.tsx）用に整える
 *
 * - 一番上の段落・見出しなどに通し番号（data-b）を振る。しおり・続きから読む位置はこの番号で覚える
 *   （文字の大きさを変えるとページ番号が変わるので、ページ番号では覚えない）
 * - 中身のない段落（Web 小説によくある 1 行空け）に rb-blank を付ける（詰めるかどうかを設定で選べる）
 * - ルビ「|漢字《かんじ》」「｜漢字《かんじ》」と傍点「《《強調》》」を ruby / em にする
 *   （「輸送船《エルシオン》」のように縦棒のない《》は作者が括弧として使っていることが多いので変えない）
 * - 縦書きで横に並べる 2 桁の半角数字・「!?」「!!」に rb-tcy を付ける（縦中横。横書きでは何もしない）
 * - “ ” は縦書きだと横向きのまま間が空くので、縦書きでは〝 〟を出す（両方を入れて CSS でどちらかを隠す）
 * - 目次の候補（見出しと、「◆」「第1話」などで始まる短い段落）を集める
 * - 「[改ページ]」「［改ページ］」「[newpage]」を改ページの印（rb-page-break）にする。次の段落は次のページから始まる。
 *   段落の途中（挿絵の直後など）に書かれていても、そこで段落を分けて改ページする
 *
 * 文字列の置き換えではなく DOM を組み立てるので、本文の文字が HTML として解釈されることはない
 */

export type BookHeading = {
  /** data-b の番号 */
  block: number
  text: string
  level: number
}

export type PreparedBook = {
  html: string
  blockCount: number
  headings: BookHeading[]
  /** 本文の文字数（残り時間の目安に使う） */
  charCount: number
  /** 番号ごとの文字数の累計（しおりの一覧で位置を % で出す） */
  blockCharOffsets: number[]
  /** 番号ごとの書き出し（しおりの一覧に出す） */
  blockExcerpts: string[]
}

const RUBY_PATTERN = /[|｜]([^|｜《》\n]{1,30})《([^《》\n]{1,30})》/g
const EMPHASIS_PATTERN = /《《([^《》\n]{1,60})》》/g
const TCY_PATTERN =
  /(?<![0-9A-Za-z.,:])([0-9]{2}|[!?！？]{2})(?![0-9A-Za-z.,:])/g
const QUOTE_PATTERN = /[“”]/g
const HEADING_LIKE_PATTERN =
  /^(?:[◆◇■□●○★☆▼▽※【]|第[0-9０-９一二三四五六七八九十百千]+[話章節部幕]|(?:プロローグ|エピローグ|序章|終章|幕間)(?:\s|　|$))/

/** 改ページの印。閉じ括弧の書き忘れ（「[改ページ」）も印にする（g を付けて使うときは new RegExp(source, "gi") で作り直す） */
export const PAGE_BREAK_MARKER_PATTERN =
  /[\[［]\s*(?:改ページ|改頁|newpage)\s*[\]］]?/i
const PAGE_BREAK_PATTERN = new RegExp(
  `^${PAGE_BREAK_MARKER_PATTERN.source}$`,
  "i",
)

/** 改ページの印として書かれた行か（作品ページでは隠し、本のように読む画面では改ページにする） */
export const isPageBreakText = (text: string) =>
  PAGE_BREAK_PATTERN.test(text.trim())

/**
 * 段落の途中にある改ページの印で段落を分ける（印は印だけの段落にする）。
 * 段落の直下の文字だけを見る（太字などの中に書かれた印はそのまま）
 */
const splitPageBreaks = (doc: Document, root: Element) => {
  const paragraphs = Array.from(root.children).filter(
    (element) => element.tagName === "P",
  )
  for (const paragraph of paragraphs) {
    const text = paragraph.textContent ?? ""
    if (!PAGE_BREAK_MARKER_PATTERN.test(text) || isPageBreakText(text)) continue
    const groups: Node[][] = [[]]
    for (const child of Array.from(paragraph.childNodes)) {
      if (child.nodeType !== 3) {
        groups.at(-1)?.push(child)
        continue
      }
      const pattern = new RegExp(PAGE_BREAK_MARKER_PATTERN.source, "gi")
      const data = (child as Text).data
      let last = 0
      for (
        let match = pattern.exec(data);
        match !== null;
        match = pattern.exec(data)
      ) {
        const before = data.slice(last, match.index)
        if (before !== "") groups.at(-1)?.push(doc.createTextNode(before))
        groups.push([doc.createTextNode(match[0])], [])
        last = match.index + match[0].length
      }
      const rest = data.slice(last)
      if (rest !== "") groups.at(-1)?.push(doc.createTextNode(rest))
    }
    if (groups.length === 1) continue
    const replacements = groups
      .filter((nodes) =>
        nodes.some(
          (node) =>
            node.nodeType !== 3 || (node.textContent ?? "").trim() !== "",
        ),
      )
      .map((nodes) => {
        const next = doc.createElement("p")
        for (const node of nodes) next.appendChild(node)
        return next
      })
    for (const replacement of replacements) {
      paragraph.parentNode?.insertBefore(replacement, paragraph)
    }
    paragraph.remove()
  }
}

const SKIP_TAGS = new Set(["CODE", "PRE", "A", "RUBY", "RT", "SCRIPT", "STYLE"])

type Piece = { kind: "text"; text: string } | { kind: "node"; node: Node }

/** 1 つの正規表現で文字を区切り、当たったところを make で作った要素にする */
const splitBy = (
  pieces: Piece[],
  pattern: RegExp,
  make: (match: RegExpExecArray) => Node,
): Piece[] => {
  const result: Piece[] = []
  for (const piece of pieces) {
    if (piece.kind !== "text") {
      result.push(piece)
      continue
    }
    let last = 0
    pattern.lastIndex = 0
    for (
      let match = pattern.exec(piece.text);
      match !== null;
      match = pattern.exec(piece.text)
    ) {
      if (match.index > last) {
        result.push({ kind: "text", text: piece.text.slice(last, match.index) })
      }
      result.push({ kind: "node", node: make(match) })
      last = match.index + match[0].length
    }
    if (last < piece.text.length) {
      result.push({ kind: "text", text: piece.text.slice(last) })
    }
  }
  return result
}

const decorateTextNode = (doc: Document, textNode: Text) => {
  const text = textNode.data
  if (!/[|｜《!?！？0-9“”]/.test(text)) return

  let pieces: Piece[] = [{ kind: "text", text }]
  pieces = splitBy(pieces, EMPHASIS_PATTERN, (match) => {
    const em = doc.createElement("em")
    em.className = "rb-dots"
    em.textContent = match[1] ?? ""
    return em
  })
  pieces = splitBy(pieces, RUBY_PATTERN, (match) => {
    const ruby = doc.createElement("ruby")
    ruby.appendChild(doc.createTextNode(match[1] ?? ""))
    const rt = doc.createElement("rt")
    rt.textContent = match[2] ?? ""
    ruby.appendChild(rt)
    return ruby
  })
  pieces = splitBy(pieces, TCY_PATTERN, (match) => {
    const span = doc.createElement("span")
    span.className = "rb-tcy"
    span.textContent = match[1] ?? ""
    return span
  })
  pieces = splitBy(pieces, QUOTE_PATTERN, (match) => {
    const fragment = doc.createDocumentFragment()
    const horizontal = doc.createElement("span")
    horizontal.className = "rb-qh"
    horizontal.textContent = match[0]
    const vertical = doc.createElement("span")
    vertical.className = "rb-qv"
    vertical.textContent = match[0] === "“" ? "〝" : "〟"
    fragment.append(horizontal, vertical)
    return fragment
  })

  if (pieces.length === 1 && pieces[0]?.kind === "text") return

  const fragment = doc.createDocumentFragment()
  for (const piece of pieces) {
    fragment.append(
      piece.kind === "text" ? doc.createTextNode(piece.text) : piece.node,
    )
  }
  textNode.replaceWith(fragment)
}

const collectTextNodes = (node: Node, result: Text[]) => {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      result.push(child as Text)
    } else if (
      child.nodeType === 1 &&
      !SKIP_TAGS.has((child as Element).tagName)
    ) {
      collectTextNodes(child, result)
    }
  }
}

const decorate = (doc: Document, root: Element) => {
  const textNodes: Text[] = []
  collectTextNodes(root, textNodes)
  for (const textNode of textNodes) decorateTextNode(doc, textNode)
}

/** 縦書き用に足した〝 〟を除いた文字（文字数・しおりの書き出しに使う） */
const textOf = (element: Element) => {
  if (element.querySelector(".rb-qv") === null) return element.textContent ?? ""
  const clone = element.cloneNode(true) as Element
  for (const quote of Array.from(clone.querySelectorAll(".rb-qv"))) {
    quote.remove()
  }
  return clone.textContent ?? ""
}

const isBlank = (element: Element) =>
  element.tagName === "P" &&
  (element.textContent ?? "").replace(/[\s　​]/g, "") === "" &&
  element.querySelector("img, video, iframe") === null

export const prepareBookHtml = (html: string): PreparedBook => {
  const doc = new DOMParser().parseFromString(
    `<!doctype html><body><div id="root">${html}</div></body>`,
    "text/html",
  )
  const root = doc.getElementById("root")
  if (root === null) {
    return {
      html: "",
      blockCount: 0,
      headings: [],
      charCount: 0,
      blockCharOffsets: [],
      blockExcerpts: [],
    }
  }

  splitPageBreaks(doc, root)

  // 最後の空の段落と改ページの印は余白のページを作るだけなので消す
  const isTrailing = (element: Element) =>
    isBlank(element) ||
    (element.tagName === "P" && isPageBreakText(element.textContent ?? ""))
  while (root.lastElementChild && isTrailing(root.lastElementChild)) {
    root.lastElementChild.remove()
  }

  decorate(doc, root)

  const headings: BookHeading[] = []
  const blockCharOffsets: number[] = []
  const blockExcerpts: string[] = []
  let charCount = 0
  let block = 0

  for (const element of Array.from(root.children)) {
    element.setAttribute("data-b", String(block))
    if (element.tagName === "P" && isPageBreakText(element.textContent ?? "")) {
      element.textContent = ""
      element.className = "rb-page-break"
      element.setAttribute("aria-hidden", "true")
      blockCharOffsets.push(charCount)
      blockExcerpts.push("")
      block += 1
      continue
    }
    const text = textOf(element).replace(/\s+/g, " ").trim()
    if (isBlank(element)) {
      element.classList.add("rb-blank")
    }
    for (const image of Array.from(element.querySelectorAll("img"))) {
      image.setAttribute("loading", "eager")
      image.setAttribute("decoding", "async")
    }

    const headingLevel = /^H([1-6])$/.exec(element.tagName)?.[1]
    if (headingLevel !== undefined && text !== "") {
      headings.push({ block, text, level: Number(headingLevel) })
    } else if (
      element.tagName === "P" &&
      text.length > 0 &&
      text.length <= 40 &&
      HEADING_LIKE_PATTERN.test(text)
    ) {
      headings.push({ block, text, level: 3 })
    }

    blockCharOffsets.push(charCount)
    blockExcerpts.push(text.slice(0, 60))
    charCount += text.replace(/\s/g, "").length
    block += 1
  }

  return {
    html: root.innerHTML,
    blockCount: block,
    headings,
    charCount,
    blockCharOffsets,
    blockExcerpts,
  }
}
