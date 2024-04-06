"use client"

import { Textarea } from "@/_components/ui/textarea"
import { forwardRef } from "react"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

/**
 * 自動リサイズのテキストエリア
 * TODO: 修正が必要
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
  (props, ref) => {
    return (
      <Textarea
        ref={ref}
        {...props}
        style={{ minHeight: "unset", overflow: "hidden", resize: "none" }}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
