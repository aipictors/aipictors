import "zenn-content-css"

import { cn } from "@/_lib/utils"
import type React from "react"
import markdownToHtml from "zenn-markdown-html"

type Props = {
  className?: string
  children: React.ReactNode
}

export const AppMarkdown = (props: Props) => {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const html = markdownToHtml(props.children, {})

  return (
    <div
      className={cn("znc font-medium", props.className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
