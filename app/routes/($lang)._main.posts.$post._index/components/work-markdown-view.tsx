import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Image from "@tiptap/extension-image"
import { useEffect, useState } from "react"
import { XIcon } from "lucide-react"

type Props = {
  md?: string
  html?: string
  thumbnailUrl: string
  title: string
}

export function WorkMarkdownView (props: Props) {
  const editor = useEditor({
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-full min-h-[150px] w-full border-none bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
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

  // 挿絵（本文中の画像）をクリックしたら原寸で表示する
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!zoomedImageUrl) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomedImageUrl(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [zoomedImageUrl])

  const onClickContent = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof HTMLImageElement && target.src) {
      event.preventDefault()
      setZoomedImageUrl(target.currentSrc || target.src)
    }
  }

  return (
    <div className="relative m-0">
      <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-80">
        <img
          src={props.thumbnailUrl}
          alt="Thumbnail Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex h-full w-full items-center justify-center bg-black bg-opacity-40">
          <button
            type="button"
            className="h-3/4 w-3/4 cursor-zoom-in"
            onClick={() => setZoomedImageUrl(props.thumbnailUrl)}
            aria-label="表紙を大きく表示"
          >
            <img
              src={props.thumbnailUrl}
              alt="Thumbnail Foreground"
              className="h-full w-full object-contain"
            />
          </button>
          <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-black bg-opacity-50 p-4 text-center font-bold text-2xl text-white md:text-4xl">
            {props.title}
          </div>
        </div>
      </div>
      {/* 本文中の挿絵は長辺 400px までで表示し、クリックで原寸（保存は長辺 1600px）を開く */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 画像のクリックだけを拾う（キーボードでは各画像を開かない） */}
      <div
        className="mt-4 rounded-lg bg-white p-4 dark:bg-zinc-900 [&_img]:h-auto [&_img]:max-h-[400px] [&_img]:w-auto [&_img]:max-w-[min(400px,100%)] [&_img]:cursor-zoom-in [&_img]:object-contain"
        onClick={onClickContent}
      >
        <EditorContent editor={editor} />
      </div>
      {props.html && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: 画像のクリックだけを拾う
        <div
          className="[&_img]:h-auto [&_img]:max-h-[400px] [&_img]:w-auto [&_img]:max-w-[min(400px,100%)] [&_img]:cursor-zoom-in [&_img]:object-contain"
          onClick={onClickContent}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from serialized/trusted data
          dangerouslySetInnerHTML={{
            __html: props.html
              .replace(/&quot;/g, '"') // &quot; を " に置換
              .replace(/\\"/g, '"'), // \\" を " に置換
          }}
        />
      )}
      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2"
          role="dialog"
          aria-modal="true"
          aria-label="画像を大きく表示"
          onClick={() => setZoomedImageUrl(null)}
          onKeyUp={(event) => {
            if (event.key === "Escape") setZoomedImageUrl(null)
          }}
        >
          {/* 小さく保存された挿絵（10/27 以前は長辺 400px）も画面いっぱいまで広げる */}
          <img
            src={zoomedImageUrl}
            alt=""
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white"
            onClick={() => setZoomedImageUrl(null)}
            aria-label="閉じる"
          >
            <XIcon className="size-6" />
          </button>
        </div>
      )}
    </div>
  )
}
