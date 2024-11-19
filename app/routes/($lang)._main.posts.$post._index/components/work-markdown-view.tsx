import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Image from "@tiptap/extension-image"
import { useEffect } from "react"

type Props = {
  md?: string
  html?: string
  thumbnailUrl: string
  title: string
}

export function WorkMarkdownView(props: Props) {
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-full min-h-[150px] w-full border-none bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
      },
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
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
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-800 text-white text-sm p-2 rounded-md",
          languageClassPrefix: "language-",
        },
      }),
      Blockquote,
      HorizontalRule,
    ],
    content: props.md,
  })

  useEffect(() => {
    if (editor && editor.getText() === "") {
      editor.commands.setContent(props.md || "")
    }
  }, [props.md, editor])

  return (
    <div className="relative m-0">
      <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-80">
        <img
          src={props.thumbnailUrl}
          alt="Thumbnail Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex h-full w-full items-center justify-center bg-black bg-opacity-40">
          <img
            src={props.thumbnailUrl}
            alt="Thumbnail Foreground"
            className="h-3/4 w-3/4 object-contain"
          />
          <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-black bg-opacity-50 p-4 text-center font-bold text-2xl text-white md:text-4xl">
            {props.title}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-white p-4 dark:bg-zinc-900">
        <EditorContent editor={editor} />
      </div>
      {props.html && (
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: props.html
              .replace(/&quot;/g, '"') // &quot; を " に置換
              .replace(/\\"/g, '"'), // \\" を " に置換
          }}
        />
      )}
    </div>
  )
}
