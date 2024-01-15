import "zenn-content-css"

import React from "react"
import markdownToHtml from "zenn-markdown-html"

type Props = {
  children: React.ReactNode
}

export const AppMarkdown = (props: Props) => {
  if (typeof props.children !== "string") {
    return <>{props.children}</>
  }

  const html = markdownToHtml(props.children, {})

  return (
    <div
      className="znc font-medium"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
