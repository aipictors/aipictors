import { useEffect, useRef } from "react"
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core"
import { commonmark } from "@milkdown/preset-commonmark"
import { nord } from "@milkdown/theme-nord"
import { toggleStrongCommand } from "@milkdown/preset-commonmark"
import { Button } from "@/_components/ui/button"

export const MarkdownEditor = () => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const editorInstance = useRef<Editor | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, editorRef.current)
        ctx.set(defaultValueCtx, "Hello, Milkdown!")
      })
      .use(nord)
      .use(commonmark)

    editor.create().then((instance) => {
      editorInstance.current = instance
    })

    return () => {
      editorInstance.current?.destroy()
    }
  }, [])

  const toggleBold = () => {
    if (!editorInstance.current) return

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    editorInstance.current.action((ctx: any) => {
      ctx.call(toggleStrongCommand.key)
    })
  }

  return (
    <div>
      <div ref={editorRef} />
      <Button onClick={toggleBold}>Bold</Button>
    </div>
  )
}
