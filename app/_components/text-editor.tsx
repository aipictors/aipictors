import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Strikethrough, Italic, List, ListOrdered } from "lucide-react"
import { Toggle } from "@/_components/ui/toggle"
import { Separator } from "@/_components/ui/separator"
import { Markdown } from "tiptap-markdown"
import Image from "@tiptap/extension-image"
import { useCallback, useContext } from "react"
import { Button } from "@/_components/ui/button"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { AuthContext } from "@/_contexts/auth-context"
import { TextEditorUploaderDialog } from "@/_components/text-editor-uploader-dialog"

const TextEditor = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
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
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value, // Set the initial content with the provided value
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown()) // Call the onChange callback with the updated HTML content
    },
  })

  return (
    <>
      <EditorContent editor={editor} />
      {editor ? <RichTextEditorToolbar editor={editor} /> : null}
    </>
  )
}

const RichTextEditorToolbar = ({ editor }: { editor: Editor }) => {
  const authContext = useContext(AuthContext)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading,
  })

  const addImage = useCallback(
    (url: string) => {
      if (url) {
        editor?.chain().focus().setImage({ src: url }).run()
      }
    },
    [editor],
  )

  return (
    <div className="flex flex-row items-center gap-1 rounded-br-md rounded-bl-md border border-input bg-transparent p-1">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-8 w-[1px]" />
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      {token?.viewer?.token && (
        <TextEditorUploaderDialog
          token={token?.viewer?.token}
          onSelectImage={addImage}
        >
          <Button size="sm" variant={"secondary"}>
            {"画像"}
          </Button>
        </TextEditorUploaderDialog>
      )}
    </div>
  )
}

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      token
    }
  }`,
)

export default TextEditor
