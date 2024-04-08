import "zenn-content-css"

import { cn } from "@/_lib/utils"
import { marked } from "marked"
import type React from "react"

type Props = {
  className?: string
  children: React.ReactNode
}

export const AppMarkdown = (props: Props) => {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const html = marked(props.children, {})

  return (
    <div
      className={cn("znc font-medium", props.className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
