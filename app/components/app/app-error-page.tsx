import { useLocation } from "@remix-run/react"
import { useEffect, useState } from "react"
import { AppStatusPageShell } from "~/components/app/app-status-page-shell"
import { useTranslation } from "~/hooks/use-translation"
import { getPathLocale } from "~/utils/locale-path"
import { ERROR_LINES, getDailyLineIndex } from "~/utils/pictor-chan-lines"

/** 同じページは 1 分に 3 回まで読み込み直す（temporarily-unavailable-page と同じ決まり）。回数を超えたら null */
const takeAutoReloadDelay = (pathname: string): number | null => {
  try {
    const key = `aip-reload:${pathname}`
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "{}") as {
      n?: number
      t?: number
    }
    const count = Date.now() - (saved.t ?? 0) < 60_000 ? (saved.n ?? 0) : 0
    if (count >= 3) return null
    sessionStorage.setItem(key, JSON.stringify({ n: count + 1, t: Date.now() }))
    return 2000 + count * 3000
  } catch {
    return null
  }
}

type Props = Readonly<{
  status: number
  message: string
  /** root の ErrorBoundary から出すとき */
  standalone?: boolean
}>

/**
 * エラー時に .data URL を検知してリダイレクトする。
 * エラーの詳細は画面に出さず、コンソールにだけ残す
 */
export function AppErrorPage (props: Props): React.ReactNode {
  const t = useTranslation()
  const { pathname } = useLocation()
  const prefix = getPathLocale(pathname) === "en" ? "/en" : ""

  const [line] = useState(
    () => ERROR_LINES[getDailyLineIndex(ERROR_LINES.length, new Date())],
  )

  // route の ErrorBoundary からは文字列以外の data が来ることもある
  const message = String(props.message)

  useEffect(() => {
    console.error(message)
  }, [message])

  // サーバーの一時的な失敗（ページ移動のデータ取得など）は、エラーを見せずに読み込み直す
  const [isReloading, setIsReloading] = useState(props.status >= 500)

  useEffect(() => {
    if (props.status < 500) return
    const delay = takeAutoReloadDelay(pathname)
    if (delay === null) {
      setIsReloading(false)
      return
    }
    const timer = setTimeout(() => window.location.reload(), delay)
    return () => clearTimeout(timer)
  }, [props.status, pathname])

  // .data の URL を含むエラーの場合にリダイレクト処理を実行
  if (
    message.includes("Unable to decode turbo-stream response from URL:") &&
    message.includes(".data")
  ) {
    // 正規表現でエラー内の URL を抽出
    const match = message.match(
      /https:\/\/www\.aipictors\.com\/[^\s]+\.data/,
    )
    if (match) {
      const originalUrl = match[0]
      const redirectUrl = originalUrl.replace(/\.data$/, "") // .data を取り除く
      window.location.replace(redirectUrl)
      return null // リダイレクト中は何も表示しない
    }
  }

  if (isReloading) {
    return (
      <AppStatusPageShell
        homePath={prefix || "/"}
        standalone={props.standalone}
      >
        <p className="text-center text-sm">
          {t(
            "少し混み合っています。自動で読み込み直しています…",
            "We're a little busy right now. Reloading automatically…",
          )}
        </p>
      </AppStatusPageShell>
    )
  }

  return (
    <AppStatusPageShell homePath={prefix || "/"} standalone={props.standalone}>
      <img
        src="/images/pictor-chan/oops.webp"
        alt=""
        width={320}
        height={332}
        fetchPriority="high"
        className="mt-2 aspect-320/332 w-40 motion-safe:animate-[pictor-chan-wobble_1.6s_ease-in-out_2] md:w-48"
        style={{ maxWidth: 192, height: "auto" }}
      />
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-bold text-xl md:text-2xl">
          {t("うまく表示できませんでした", "Something went wrong")}
        </h1>
        <p
          className="max-w-md rounded-2xl bg-muted px-4 py-3 text-left text-sm leading-relaxed"
          suppressHydrationWarning
        >
          {t(line[0], line[1])}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="min-h-11 cursor-pointer rounded-full bg-clear-bright-blue px-8 font-medium text-sm text-white transition-opacity hover:opacity-90"
          onClick={() => {
            window.location.reload()
          }}
        >
          {t("もう一度読み込む", "Reload")}
        </button>
        <a
          href={prefix || "/"}
          className="inline-flex min-h-11 items-center justify-center rounded-full border px-8 font-medium text-sm transition-colors hover:bg-accent"
        >
          {t("トップページへ戻る", "Back to the top page")}
        </a>
      </div>
      <p className="text-muted-foreground text-xs">
        {t(
          `エラーコード ${props.status}。何度も続くときは少し時間をおいてください。`,
          `Error code ${props.status}. If this keeps happening, please try again later.`,
        )}
      </p>
    </AppStatusPageShell>
  )
}
