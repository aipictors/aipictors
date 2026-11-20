import Paragraph from "@tiptap/extension-paragraph"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"

/**
 * 本文の空行（中身のない段落）を Markdown に残すための印。
 * Markdown では何も書かれていない行は段落の区切りにまとめられ、空行を何行入れても保存すると消えていた。
 * 空の段落は「&nbsp;」だけの段落として保存する（作品ページ・本のように読む画面ではそのまま 1 行の空行に見える）
 */
const BLANK_LINE_MARK = "&nbsp;"

const hasContent = (node: ProseMirrorNode) =>
  node.type.name !== "paragraph" || node.content.size > 0

/**
 * 入力欄の段落。空の段落を「&nbsp;」として書き出す。
 * 本文の最初と最後の空の段落は書き出さない（何も書いていない本文が空でなくなるのと、末尾に空行が増えるのを防ぐ）
 */
export const BlankLineParagraph = Paragraph.extend({
  addStorage() {
    return {
      markdown: {
        serialize(
          // biome-ignore lint/suspicious/noExplicitAny: tiptap-markdown の serializer の state は型が公開されていない
          state: any,
          node: ProseMirrorNode,
          parent: ProseMirrorNode,
          index: number,
        ) {
          if (node.content.size > 0) {
            state.renderInline(node)
            state.closeBlock(node)
            return
          }
          const siblings = Array.from({ length: parent.childCount }, (_, i) =>
            parent.child(i),
          )
          const isBetweenContent =
            siblings.slice(0, index).some(hasContent) &&
            siblings.slice(index + 1).some(hasContent)
          // 最初と最後の空の段落は何も書かない（区切りの改行も足さない）
          if (isBetweenContent) {
            state.write(BLANK_LINE_MARK)
            state.closeBlock(node)
          }
        },
        parse: {
          // markdown-it が読む
        },
      },
    }
  },
})

/**
 * 入力欄に読み込む前に、空行の印を空の段落に戻す（印の nbsp が入ったままだと、空行に書き始めた文の頭に空白が残る）。
 * 作品ページでは「&nbsp;」のまま表示する。コードブロックの中は変えない
 */
export function restoreBlankLines(md: string): string {
  return md
    .split(/(```[\s\S]*?```)/)
    .map((part, index) => {
      if (index % 2 === 1) return part
      return part.replace(/^&nbsp;[ \t]*$/gm, "<p></p>")
    })
    .join("")
}
