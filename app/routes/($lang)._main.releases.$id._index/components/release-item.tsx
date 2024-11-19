import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { Badge } from "~/components/ui/badge"
import Image from "@tiptap/extension-image"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { useEffect } from "react"
import { ImagesPreview } from "~/components/images-preview"

type Props = {
  title: string
  description: string
  thumbnailUrl: string | null
  platform: string
  createdAt: number
}

/**
 * リリース情報アイテム
 */
export function ReleaseItem(props: Props) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-full w-full border-none bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
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
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    editor.commands.setContent(props.description || "")
  }, [props.description, editor])

  return (
    <>
      <div className="font-bold text-lg">{props.title}</div>
      <div className="flex items-center space-x-2">
        <Badge variant={"secondary"} className="w-12 text-xs">
          <p className="w-auto text-center">{props.platform}</p>
        </Badge>
        <div className="block text-gray-400 text-xs">
          {formatDate(props.createdAt)}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-zinc-100 bg-opacity-50 p-4 dark:bg-zinc-900">
        <EditorContent editor={editor} />
      </div>
      {props.thumbnailUrl && (
        <ImagesPreview
          thumbnailUrl={props.thumbnailUrl}
          imageURLs={[props.thumbnailUrl]}
          currentIndex={0}
          setCurrentIndex={() => {}}
        />
      )}
    </>
  )
}
