import { Textarea } from "@/components/ui/textarea"
import { forwardRef } from "react"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

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
