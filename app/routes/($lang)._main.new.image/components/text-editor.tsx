import { useQuery } from "@apollo/client/index"
import Blockquote from "@tiptap/extension-blockquote"
import CodeBlock from "@tiptap/extension-code-block"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Image from "@tiptap/extension-image"
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { graphql } from "gql.tada"
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  MoreHorizontal,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Markdown } from "tiptap-markdown"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { TextEditorUploaderDialog } from "~/routes/($lang)._main.new.image/components/text-editor-uploader-dialog"
import { keepMarkdownIndent } from "~/utils/keep-markdown-indent"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

/** 本文の文字数（空白・改行・改ページの印を除く） */
const countBodyChars = (text: string) => {
  return text.replace(/[［[]\s*改ページ\s*[］\]]/g, "").replace(/\s/g, "")
    .length
}

/**
 * 小説・コラムの本文エディタ
 * - ツールバーは上に固定し、よく使う「ルビ・傍点・改ページ・挿絵」を前に出す
 * - 全画面で書ける（スマホでは画面いっぱいの原稿用紙のように使う）
 * - 文字数と原稿用紙の枚数の目安を出す
 */
const TextEditor = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  const t = useTranslation()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert w-full max-w-full bg-transparent px-4 py-4 text-base leading-loose focus-visible:outline-hidden md:px-6",
          "prose-p:my-0 [&_p]:min-h-[1.75em]",
        ),
        "aria-label": t("本文", "Body"),
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
    content: keepMarkdownIndent(repairMarkdownHardBreaks(value)),
    onUpdate: ({ editor }) => {
      onChange(repairMarkdownHardBreaks(editor.storage.markdown.getMarkdown()))
    },
  })

  useEffect(() => {
    if (editor?.isEmpty) {
      editor.commands.setContent(
        keepMarkdownIndent(repairMarkdownHardBreaks(value)),
      )
    }
  }, [value, editor])

  // 全画面の間は後ろのページを動かさない。Esc で戻る
  useEffect(() => {
    if (!isFullscreen) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    editor?.commands.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isFullscreen, editor])

  const content = (
    <div
      className={cn(
        isFullscreen
          ? "fixed inset-0 z-[100] flex flex-col bg-background"
          : "rounded-md border border-input",
      )}
    >
      {editor ? (
        <RichTextEditorToolbar
          editor={editor}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((value) => !value)}
        />
      ) : (
        <div className="h-12 border-b" />
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 余白のクリックで本文にフォーカスするだけ（キーボードは本文に直接入る） */}
      <div
        className={cn(
          "cursor-text",
          isFullscreen
            ? "flex-1 overflow-y-auto"
            : "max-h-[75vh] min-h-[50vh] overflow-y-auto",
        )}
        onClick={(event) => {
          // 余白を押しても書き始められるように
          if (event.target === event.currentTarget) {
            editor?.commands.focus("end")
          }
        }}
      >
        <div className={cn(isFullscreen && "mx-auto w-full max-w-3xl")}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {editor && <TextEditorStatus editor={editor} />}
    </div>
  )

  // 全画面はページのヘッダーやサイドバーより前に出すため body の直下に出す
  if (isFullscreen && typeof document !== "undefined") {
    return createPortal(content, document.body)
  }

  return content
}

const TextEditorStatus = ({ editor }: { editor: Editor }) => {
  const t = useTranslation()
  const charCount = useEditorState({
    editor,
    selector: ({ editor }) => countBodyChars(editor.getText()),
  })
  const isEmpty = charCount === 0

  return (
    <div className="flex items-center justify-between gap-2 border-t px-3 py-1.5 text-muted-foreground text-xs">
      <span>
        {isEmpty
          ? t(
              "ここに本文を書きます。字下げは全角スペースで入れられます",
              "Write the text here.",
            )
          : t(
              `${charCount.toLocaleString()} 文字（原稿用紙 約 ${Math.max(1, Math.ceil(charCount / 400))} 枚）`,
              `${charCount.toLocaleString()} characters`,
            )}
      </span>
    </div>
  )
}

type ToolButtonProps = {
  label: string
  isActive?: boolean
  onClick: () => void
  children: React.ReactNode
  /** 文字のラベルも出す（小説でよく使うもの） */
  showLabel?: boolean
}

const ToolButton = (props: ToolButtonProps) => {
  return (
    <Button
      type="button"
      size="sm"
      variant={props.isActive ? "secondary" : "ghost"}
      aria-label={props.label}
      aria-pressed={props.isActive}
      title={props.label}
      // ボタンを押してもエディタの選択範囲を外さない
      onMouseDown={(event) => event.preventDefault()}
      onClick={props.onClick}
      className={cn("h-9 shrink-0 gap-1 px-2", props.showLabel && "px-2.5")}
    >
      {props.children}
      {props.showLabel && <span className="text-xs">{props.label}</span>}
    </Button>
  )
}

const RichTextEditorToolbar = ({
  editor,
  isFullscreen,
  onToggleFullscreen,
}: {
  editor: Editor
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) => {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data: token } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading,
  })

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive("heading", { level: 2 }),
      bold: editor.isActive("bold"),
      blockquote: editor.isActive("blockquote"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  })

  const addImage = useCallback(
    (url: string) => {
      if (url) {
        editor?.chain().focus().setImage({ src: url }).run()
      }
    },
    [editor],
  )

  /** 選んだ文字を囲む。何も選んでいなければ囲みだけ入れて、間にカーソルを置く */
  const wrapSelection = (before: string, after: string, caretInAfter = 0) => {
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to, "")
    const text = `${before}${selected}${after}`
    // マークダウンとして読ませない（｜や《》をそのまま入れる）
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, { type: "text", text })
      .run()
    const caret =
      selected === ""
        ? from + before.length
        : from + text.length - after.length + caretInAfter
    editor.chain().setTextSelection(caret).run()
  }

  const insertRuby = () => {
    // ｜漢字《かんじ》 … 読みを入れる位置（《 の後ろ）にカーソルを置く
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to, "")
    if (selected === "") {
      wrapSelection("｜", "《》")
      return
    }
    wrapSelection("｜", "《》", 1)
  }

  const insertPageBreak = () => {
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "paragraph",
          content: [{ type: "text", text: "［改ページ］" }],
        },
        { type: "paragraph" },
      ])
      .run()
  }

  return (
    <div
      className={cn(
        "z-20 flex items-center border-b bg-background/95 backdrop-blur",
        isFullscreen
          ? "pt-[env(safe-area-inset-top)]"
          : "sticky top-[60px] rounded-t-md md:top-[72px]",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1 py-1">
        <ToolButton
          label={t("見出し", "Heading")}
          showLabel
          isActive={active.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </ToolButton>
        <ToolButton
          label={t("太字", "Bold")}
          showLabel
          isActive={active.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolButton>
        <ToolButton label={t("ルビ", "Ruby")} showLabel onClick={insertRuby}>
          <span className="text-[10px] leading-none">
            <ruby>
              漢<rt>かん</rt>
            </ruby>
          </span>
        </ToolButton>
        <ToolButton
          label={t("傍点", "Emphasis dots")}
          showLabel
          onClick={() => wrapSelection("《《", "》》")}
        >
          <span className="text-xs">﹅</span>
        </ToolButton>
        <ToolButton
          label={t("改ページ", "Page break")}
          showLabel
          onClick={insertPageBreak}
        >
          <span className="text-xs">⤓</span>
        </ToolButton>
        {token?.viewer?.token && (
          <TextEditorUploaderDialog
            token={token.viewer.token}
            onSelectImage={addImage}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 shrink-0 gap-1 px-2.5"
              title={t("挿絵", "Illustration")}
            >
              <ImageIcon className="size-4" />
              <span className="text-xs">{t("挿絵", "Image")}</span>
            </Button>
          </TextEditorUploaderDialog>
        )}
        <ToolButton
          label={t("区切り線", "Divider")}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolButton>
        <ToolButton
          label={t("引用", "Quote")}
          isActive={active.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 shrink-0 px-2"
              aria-label={t("その他の書式", "More formatting")}
              title={t("その他の書式", "More formatting")}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="z-[110]">
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="mr-2 size-4" />
              {t("斜体", "Italic")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="mr-2 size-4" />
              {t("取り消し線", "Strikethrough")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="mr-2 size-4" />
              {t("大見出し", "Heading 1")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="mr-2 size-4" />
              {t("小見出し", "Heading 3")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="mr-2 size-4" />
              {t("箇条書き", "Bullet list")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="mr-2 size-4" />
              {t("番号付きリスト", "Numbered list")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="mr-2 size-4" />
              {t("コード", "Code")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* 元に戻す・全画面は横にスクロールしても常に見える位置に置く */}
      <div className="flex shrink-0 items-center gap-0.5 border-l px-1 py-1">
        <ToolButton
          label={t("元に戻す", "Undo")}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className={cn("size-4", !active.canUndo && "opacity-40")} />
        </ToolButton>
        <ToolButton
          label={t("やり直す", "Redo")}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className={cn("size-4", !active.canRedo && "opacity-40")} />
        </ToolButton>
        <ToolButton
          label={
            isFullscreen
              ? t("全画面を閉じる", "Exit full screen")
              : t("全画面で書く", "Full screen")
          }
          showLabel={false}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </ToolButton>
      </div>
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
