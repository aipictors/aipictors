import type { TextareaProps } from "@chakra-ui/react"
import { Textarea } from "@chakra-ui/react"
import { forwardRef } from "react"
import ResizeTextarea from "react-textarea-autosize"

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>((props, ref) => {
  return (
    <Textarea
      minH={"unset"}
      overflow={"hidden"}
      resize={"none"}
      ref={ref}
      as={ResizeTextarea}
      {...props}
    />
  )
})

AutoResizeTextarea.displayName = "AutoResizeTextarea"
