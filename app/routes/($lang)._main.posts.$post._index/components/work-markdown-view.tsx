import Blockquote from "@tiptap/extension-blockquote"
import CodeBlock from "@tiptap/extension-code-block"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Image from "@tiptap/extension-image"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { BookOpenIcon, XIcon } from "lucide-react"
import { lazy, Suspense, useEffect, useState } from "react"
import { Markdown } from "tiptap-markdown"
import { HidePageBreakMarkers } from "~/components/book-reader/hide-page-break-markers"
import { useTranslation } from "~/hooks/use-translation"
import { keepMarkdownIndent } from "~/utils/keep-markdown-indent"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

// 本のように読む画面は開いたときにだけ読み込む
const BookReader = lazy(() =>
  import("~/components/book-reader/book-reader").then((mod) => ({
    default: mod.BookReader,
  })),
)

/**
 * アプリの中の WebView で「本のように読む」を開いているときだけ、アプリ側に知らせる
 * （アプリは webview_flutter の JavaScriptChannel を AipictorsApp という名前で入れている）
 */
const postToApp = (message: string) => {
  if (typeof window === "undefined") return
  const channel = (
    window as unknown as {
      AipictorsApp?: { postMessage?: (value: string) => void }
    }
  ).AipictorsApp
  try {
    channel?.postMessage?.(message)
  } catch {
    // アプリ以外（普通のブラウザ）では何もしない
  }
}

type Props = {
  md?: string
  html?: string
  thumbnailUrl: string
  title: string
  /** 渡したときだけ「本のように読む」を出す（しおり・続きの位置を作品ごとに覚える） */
  workId?: string
  workType?: "NOVEL" | "COLUMN"
  authorName?: string
  /** 本文の前に出すキャプション（本のように読む画面では扉に出す） */
  foreword?: string
}

export function WorkMarkdownView(props: Props) {
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
      // 「[改ページ]」は本のように読む画面のための印なので、ここでは出さない
      HidePageBreakMarkers,
    ],
    content: keepMarkdownIndent(repairMarkdownHardBreaks(props.md ?? "")),
  })

  // 同じタブで別の作品へ移動すると同じエディタのまま md だけ変わるので、毎回入れ直す
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(
        keepMarkdownIndent(repairMarkdownHardBreaks(props.md || "")),
      )
    }
  }, [props.md, editor])

  const t = useTranslation()

  // 本のように読む（見開き・縦書き・しおり）。?reader=1 で開いたときは本文が届いたら開く
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [readerHtml, setReaderHtml] = useState("")
  const canOpenReader = props.workId !== undefined && Boolean(props.md)

  const openReader = () => {
    if (!editor) return
    setReaderHtml(editor.getHTML())
    setIsReaderOpen(true)
  }

  // ?reader=1 で開いたときは、本文が入り次第、本のように読む画面を開く。
  // 本文は後から届くので、入るまで少しのあいだ待つ（アプリの WebView もこの道を通る）
  useEffect(() => {
    if (!canOpenReader || !editor) return
    if (new URLSearchParams(window.location.search).get("reader") !== "1")
      return
    let timer = 0
    const open = () => {
      if (editor.isDestroyed) return
      if (editor.getText() === "") {
        timer = window.setTimeout(open, 200)
        return
      }
      setReaderHtml(editor.getHTML())
      setIsReaderOpen(true)
      // アプリから開いたときは、読み込み中の表示を消せるように知らせる
      postToApp("ready")
    }
    open()
    return () => window.clearTimeout(timer)
  }, [canOpenReader, editor])

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
      {/* 投稿画面のプレビューでカバー画像をまだ選んでいないときは出さない */}
      {props.thumbnailUrl !== "" && (
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
      )}
      {canOpenReader && (
        <button
          type="button"
          onClick={openReader}
          className="group mt-4 flex w-full items-center gap-4 overflow-hidden rounded-lg border border-amber-900/15 bg-gradient-to-r from-[#fbf6ea] to-[#f3e8d0] px-4 py-3 text-left text-[#3b2f22] shadow-sm transition hover:shadow-md dark:border-amber-100/10 dark:from-[#2a2620] dark:to-[#211d18] dark:text-[#eadfcb]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#b4383a] text-white shadow transition group-hover:scale-105">
            <BookOpenIcon className="size-5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-base">
              {t("本のように読む", "Read like a book")}
            </span>
            <span className="text-xs opacity-75">
              {props.workType === "NOVEL"
                ? t(
                    "縦書き・見開き・しおり・文字の大きさ。折りたたみスマホやタブレットは見開きで",
                    "Vertical text, two-page spread, bookmarks and text size",
                  )
                : t(
                    "見開き・しおり・文字の大きさ。タブレットや折りたたみスマホにも",
                    "Two-page spread, bookmarks and text size",
                  )}
            </span>
          </span>
        </button>
      )}
      {isReaderOpen && props.workId !== undefined && (
        <Suspense fallback={null}>
          <BookReader
            html={readerHtml}
            title={props.title}
            authorName={props.authorName}
            coverUrl={props.thumbnailUrl || undefined}
            foreword={props.foreword}
            workId={props.workId}
            workType={props.workType ?? "NOVEL"}
            onClose={() => {
              setIsReaderOpen(false)
              // アプリの中で開いているときは、そのまま画面を閉じてもらう
              postToApp("close")
              const url = new URL(window.location.href)
              if (url.searchParams.has("reader")) {
                url.searchParams.delete("reader")
                window.history.replaceState(window.history.state, "", url)
              }
            }}
          />
        </Suspense>
      )}
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
