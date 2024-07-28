import "zenn-content-css"

import { cn } from "@/lib/cn"
import { marked } from "marked"
import type React from "react"

type Props = Readonly<{
  className?: string
  children: React.ReactNode
}>

export function AppMarkdown(props: Props) {
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
