/**
 * 段落の先頭の全角スペース（字下げ「　」）が、本文を読み込むときに消えないようにする。
 * 入力欄（tiptap-markdown）は字下げを Markdown にそのまま保存するが、
 * 読み込むときに markdown-it が段落の行頭の空白（全角スペースも含む）を取り除いてしまう。
 * 行頭（引用「>」・箇条書きの印のあとも含む）の全角スペースを文字参照 &#x3000; にして読み込ませる。
 * 保存する本文は変えず、読み込む前（入力欄・作品ページ）にだけ通す。コードブロックの中は変えない
 */
export function keepMarkdownIndent(md: string): string {
  return md
    .split(/(```[\s\S]*?```)/)
    .map((part, index) => {
      if (index % 2 === 1) return part
      return part.replace(
        /^((?:[ \t]{0,3}>[ \t]?)*(?:[ \t]{0,3}(?:[-*+]|\d{1,9}[.)])[ \t]+)?)(　+)/gm,
        (_, prefix: string, indent: string) =>
          prefix + "&#x3000;".repeat(indent.length),
      )
    })
    .join("")
}
