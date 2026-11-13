import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { type ComponentType, useEffect, useState } from "react"
import type { BookReader as BookReaderComponent } from "~/components/book-reader/book-reader"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { fetchMarkdownText } from "~/utils/fetch-markdown-text"
import { keepMarkdownIndent } from "~/utils/keep-markdown-indent"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

/**
 * 「本のように読む」だけの画面（/posts/:id/reader）。
 * アプリの WebView から開く。作品ページ（コメント・関連作品・ヘッダーなど）を読まずに、
 * 本文と読書画面だけを読むので早く開く。普通のブラウザで開いても読める
 */

const MARKDOWN_TIMEOUT_MS = 5_000

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.post === undefined ||
    !/^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(
      props.params.post,
    )
  ) {
    throw new Response(null, { status: 404 })
  }

  const workResp = await loaderClient.query({
    query: readerWorkQuery,
    variables: { id: props.params.post },
    // 作品ページを開いたときに数えているので、読書画面では閲覧数に数えない
    context: { headers: { "x-aipictors-no-view": "1" } },
  })

  const work = workResp.data.work
  if (
    work === null ||
    work.accessType === "PRIVATE" ||
    work.accessType === "DRAFT" ||
    (work.type !== "NOVEL" && work.type !== "COLUMN")
  ) {
    throw new Response(null, { status: 404 })
  }

  // 本文もここで取っておく（端末から取り直す往復を省く）。取れなければ画面側で取る
  const md = work.mdUrl
    ? await Promise.race([
        fetchMarkdownText(work.mdUrl).catch(() => null),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), MARKDOWN_TIMEOUT_MS),
        ),
      ])
    : ""

  return json(
    { work, md },
    {
      // 本文は編集のたびに同じ URL へ上書きされるので、共有のキャッシュには置かない
      headers: { "Cache-Control": "private, no-cache" },
    },
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control") ?? "private, no-cache",
})

export const meta: MetaFunction<typeof loader> = (props) => [
  { title: props.data ? `${props.data.work.title} | Aipictors` : "Aipictors" },
  // 作品ページと同じ内容なので検索結果には出さない
  { name: "robots", content: "noindex" },
]

/**
 * アプリの中の WebView で開いているときだけ、アプリ側に知らせる
 * （アプリは webview_flutter の JavaScriptChannel を AipictorsApp という名前で入れている）
 */
const postToApp = (message: string) => {
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

/** 本文の Markdown を、作品ページと同じ tiptap の設定で HTML にする */
const toReaderHtml = async (md: string) => {
  const [{ Editor }, { createWorkMarkdownExtensions }] = await Promise.all([
    import("@tiptap/core"),
    import("~/components/book-reader/work-markdown-extensions"),
  ])
  const editor = new Editor({
    editable: false,
    extensions: createWorkMarkdownExtensions(),
    content: keepMarkdownIndent(repairMarkdownHardBreaks(md)),
  })
  const html = editor.getHTML()
  editor.destroy()
  return html
}

export default function PostReader() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const navigate = useNavigate()
  const work = data.work

  const [reader, setReader] = useState<{
    html: string
    BookReader: ComponentType<Parameters<typeof BookReaderComponent>[0]>
  } | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setReader(null)
    setFailed(false)
    const load = async () => {
      const md =
        data.md ?? (work.mdUrl ? await fetchMarkdownText(work.mdUrl) : "")
      const [html, mod] = await Promise.all([
        toReaderHtml(md),
        import("~/components/book-reader/book-reader"),
      ])
      if (!isCurrent) return
      setReader({ html, BookReader: mod.BookReader })
      // アプリから開いたときは、読み込み中の表示を消せるように知らせる
      postToApp("ready")
    }
    load().catch((error) => {
      console.error(error)
      if (isCurrent) setFailed(true)
    })
    return () => {
      isCurrent = false
    }
  }, [data.md, work.mdUrl])

  const title = t(work.title, work.enTitle || undefined)
  const description = t(
    work.description ?? "",
    work.enDescription ?? work.description ?? "",
  )
  const foreword =
    work.isCaptionBeforeBody === true && description.trim() !== ""
      ? description
      : undefined

  const onClose = () => {
    // アプリの中で開いているときは、そのまま画面を閉じてもらう
    postToApp("close")
    if ("AipictorsApp" in window) return
    if (window.history.length > 1) navigate(-1)
    else navigate(`/posts/${work.id}`, { replace: true })
  }

  if (failed) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center text-sm">
        <p>{t("本文を読み込めませんでした", "Could not load the text")}</p>
        <button
          type="button"
          className="rounded-full border px-4 py-2"
          onClick={() => window.location.reload()}
        >
          {t("もう一度読み込む", "Retry")}
        </button>
      </div>
    )
  }

  if (reader === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#fbf6ea] text-[#3b2f22] text-sm dark:bg-[#211d18] dark:text-[#eadfcb]">
        <div className="size-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
        <p className="opacity-75">
          {t(`「${title}」を開いています`, `Opening "${title}"`)}
        </p>
      </div>
    )
  }

  const { BookReader } = reader
  return (
    <BookReader
      html={reader.html}
      title={title}
      authorName={work.user?.name}
      coverUrl={work.imageURL || undefined}
      foreword={foreword}
      workId={work.id}
      workType={work.type === "COLUMN" ? "COLUMN" : "NOVEL"}
      onClose={onClose}
    />
  )
}

const readerWorkQuery = graphql(
  `query ReaderWork($id: ID!) {
    work(id: $id) {
      id
      title
      enTitle
      type
      accessType
      mdUrl
      imageURL
      description
      enDescription
      isCaptionBeforeBody
      user {
        id
        name
      }
    }
  }`,
)
