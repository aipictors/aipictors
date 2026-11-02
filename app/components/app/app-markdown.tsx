import "zenn-content-css"

import { cn } from "~/lib/utils"
import { marked } from "marked"
import type React from "react"

type Props = Readonly<{
  className?: string
  breaks?: boolean
  /** ページ側に h1 があるとき、本文の # を h2 に下げる */
  isDemotedHeading?: boolean
  children: React.ReactNode
}>

export function AppMarkdown (props: Props): React.ReactNode {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const options = { breaks: props.breaks ?? false }
  const tokens = marked.lexer(props.children, options)
  if (props.isDemotedHeading) {
    for (const token of tokens) {
      if (token.type === "heading" && token.depth < 6) token.depth += 1
    }
  }
  const html = marked.parser(tokens, options)

  return (
    <div
      className={cn(
        "znc",
        // 基本的なスタイル
        "text-foreground leading-relaxed",
        // ヘッダーのスタイル
        "[&>h1]:mt-8 [&>h1]:mb-6 [&>h1]:border-b [&>h1]:pb-2 [&>h1]:font-bold [&>h1]:text-2xl [&>h1]:text-foreground",
        "[&>h2]:mt-6 [&>h2]:mb-4 [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:text-xl",
        "[&>h3]:mt-4 [&>h3]:mb-3 [&>h3]:font-medium [&>h3]:text-foreground [&>h3]:text-lg",
        // 見出しを下げても見た目は 1 段上のままにする
        props.isDemotedHeading &&
          "[&>h2]:mt-8 [&>h2]:mb-6 [&>h2]:border-b [&>h2]:pb-2 [&>h2]:font-bold [&>h2]:text-2xl [&>h3]:mt-6 [&>h3]:mb-4 [&>h3]:font-semibold [&>h3]:text-xl",
        // パラグラフとリストのスタイル
        "[&>p]:mb-4 [&>p]:text-muted-foreground [&>p]:leading-relaxed",
        "[&>ul>li]:mb-2 [&>ul>li]:text-muted-foreground [&>ul>li]:leading-relaxed [&>ul]:mb-4 [&>ul]:pl-6",
        "[&>ol>li]:mb-2 [&>ol>li]:text-muted-foreground [&>ol>li]:leading-relaxed [&>ol]:mb-4 [&>ol]:pl-6",
        // リンクのスタイル
        "[&>p>a]:text-blue-600 [&>p>a]:underline [&>p>a]:underline-offset-2 hover:[&>p>a]:text-blue-800 dark:[&>p>a]:text-blue-400 dark:hover:[&>p>a]:text-blue-300",
        // ブロッククォートのスタイル
        "[&>blockquote]:mb-4 [&>blockquote]:border-muted [&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground [&>blockquote]:italic",
        // コードのスタイル
        "[&>pre]:mb-4 [&>pre]:overflow-x-auto [&>pre]:rounded-md [&>pre]:bg-muted [&>pre]:p-4",
        "[&>p>code]:rounded [&>p>code]:bg-muted [&>p>code]:px-2 [&>p>code]:py-1 [&>p>code]:text-sm",
        // その他のスタイル
        "[&>hr]:my-8 [&>hr]:border-border",
        props.className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from serialized/trusted data
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
