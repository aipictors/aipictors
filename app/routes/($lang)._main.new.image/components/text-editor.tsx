import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Code,
  ImageIcon,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react"
import { Toggle } from "~/components/ui/toggle"
import { Separator } from "~/components/ui/separator"
import { Markdown } from "tiptap-markdown"
import Image from "@tiptap/extension-image"
import { useCallback, useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { graphql } from "gql.tada"
import { TextEditorUploaderDialog } from "~/routes/($lang)._main.new.image/components/text-editor-uploader-dialog"

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
          "prose dark:prose-invert max-w-full min-h-[150px] w-full rounded-md rounded-br-none rounded-bl-none border border-input bg-transparent px-3 py-2 border-b-0 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
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
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())
    },
  })

  useEffect(() => {
    if (editor && editor.getText() === "") {
      editor.commands.setContent(value)
    }
  }, [value, editor])

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
        <Bold className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8 w-[1px]" />
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        {"H1"}
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        {"H2"}
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        {"H3"}
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </Toggle>
      {token?.viewer?.token && (
        <TextEditorUploaderDialog
          token={token?.viewer?.token}
          onSelectImage={addImage}
        >
          <Button size="sm" variant={"ghost"}>
            <ImageIcon className="size-4" />
          </Button>
        </TextEditorUploaderDialog>
      )}
      <Separator orientation="vertical" className="h-8 w-[1px]" />
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("horizontalRule")}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-8 w-[1px]" />
      <Toggle
        size="sm"
        pressed={editor.isActive("undo")}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("redo")}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </Toggle>
    </div>
  )
}

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

export default TextEditor
