import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"

type Props = {
  md: string
  thumbnailUrl: string
}

export const WorkMarkdownView = ({ thumbnailUrl, md }: Props) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] w-full rounded-md rounded-br-none rounded-bl-none border border-input bg-transparent px-3 py-2 border-b-0 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
      },
    },
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
      }),
      Markdown,
    ],
    content: md,
  })

  return (
    <div className="relative m-0">
      <img
        src={thumbnailUrl}
        alt="Thumbnail"
        className="m-auto h-auto w-full max-w-96"
      />

      <EditorContent editor={editor} />
    </div>
  )
}
