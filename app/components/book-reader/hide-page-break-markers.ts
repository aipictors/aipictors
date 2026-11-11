import { Extension } from "@tiptap/core"
import { Plugin } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import {
  isPageBreakText,
  PAGE_BREAK_MARKER_PATTERN,
} from "~/components/book-reader/prepare-book-html"

/**
 * 作品ページの本文で「[改ページ]」の印を出さない（本のように読む画面のための印なので）。
 * 本文のデータは変えず、表示だけ隠す。印だけの段落は段落ごと隠す
 */
export const HidePageBreakMarkers = Extension.create({
  name: "hidePageBreakMarkers",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (node.type.name === "paragraph") {
                if (
                  node.textContent !== "" &&
                  isPageBreakText(node.textContent)
                ) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      style: "display: none",
                    }),
                  )
                  return false
                }
                return true
              }
              if (!node.isText || node.text === undefined) return true
              const pattern = new RegExp(PAGE_BREAK_MARKER_PATTERN.source, "gi")
              for (
                let match = pattern.exec(node.text);
                match !== null;
                match = pattern.exec(node.text)
              ) {
                decorations.push(
                  Decoration.inline(
                    pos + match.index,
                    pos + match.index + match[0].length,
                    { style: "display: none" },
                  ),
                )
              }
              return false
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})
