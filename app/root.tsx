import "react-photo-view/dist/react-photo-view.css"
import "@fontsource-variable/m-plus-2"

import type { LinksFunction } from "@remix-run/cloudflare"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useRouteError,
} from "@remix-run/react"
import { init } from "@sentry/browser"
import { ThemeProvider } from "next-themes"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { PhotoProvider } from "react-photo-view"
import { AppAnalytics } from "~/components/app/app-analytics"
import { AppErrorPage } from "~/components/app/app-error-page"
import { AppNotFoundPage } from "~/components/app/app-not-found-page"
import { Toaster } from "~/components/app/app-sonner"
import { ContextProviders } from "~/components/context-providers"
import { ProgressBar } from "~/components/progress-bar"
import { cn } from "~/lib/utils"
import styles from "~/tailwind.css?url"
import { stashDroppedImageFiles } from "~/utils/dropped-image-files"

// パフォーマンス監視コンポーネントを遅延読み込み
const PerformanceMonitor = lazy(() =>
  import("~/components/performance-monitor").then((mod) => ({
    default: mod.PerformanceMonitor,
  })),
)

export const links: LinksFunction = () => {
  return [
    // tailwind.cssのロード
    { rel: "stylesheet", href: styles, crossOrigin: "anonymous" },
  ]
}

export function ErrorBoundary(): React.ReactNode {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <AppNotFoundPage />
  }

  if (isRouteErrorResponse(error) && 400 < error.status) {
    return <AppErrorPage status={error.status} message={error.data} />
  }

  if (error instanceof Error) {
    return <AppErrorPage status={500} message={error.message} />
  }

  return <AppNotFoundPage />
}

type Props = Readonly<{
  children: React.ReactNode
}>

/**
 * https://remix.run/docs/en/main/file-conventions/root#layout-export
 */
export function Layout(props: Props): React.ReactNode {
  const location = useLocation()
  const navigate = useNavigate()
  const [_key, setKey] = useState(
    typeof window !== "undefined" ? location.pathname : "/",
  )

  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const dragCounterRef = useRef(0)

  const htmlLang =
    location.pathname === "/en" || location.pathname.startsWith("/en/")
      ? "en"
      : "ja"

  useEffect(() => {
    if (typeof window !== "undefined") {
      setKey(location.pathname)
    }
  }, [location.pathname])

  useEffect(() => {
    if (typeof document === "undefined") return

    const handleDragStart = (event: DragEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      if (target.closest("img") !== null) {
        event.preventDefault()
      }
    }

    document.addEventListener("dragstart", handleDragStart, true)
    return () => {
      document.removeEventListener("dragstart", handleDragStart, true)
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return

    const isInNewSubtree =
      /^\/(en\/)?(r\/)?new(\/|$)/.test(location.pathname) ||
      /^\/r\/en\/new(\/|$)/.test(location.pathname)

    const getDropTargetPath = (pathname: string) => {
      const segments = pathname.split("/").filter(Boolean)

      const first = segments[0]
      const second = segments[1]

      const isLangEn = first === "en" || second === "en"
      const isSensitive = first === "r" || second === "r"

      if (isLangEn && isSensitive) {
        if (first === "en") return "/en/r/new/image"
        if (first === "r") return "/r/en/new/image"
      }

      if (isLangEn) return "/en/new/image"
      if (isSensitive) return "/r/new/image"
      return "/new/image"
    }

    const isFileDragEvent = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer
      if (!dataTransfer) return false

      // drop 時や一部ブラウザでは files が最も確実
      if (dataTransfer.files && dataTransfer.files.length > 0) {
        return true
      }

      // ブラウザによって types が空/不安定な場合があるので items も見る
      const hasFileItems = Array.from(dataTransfer.items ?? []).some(
        (item) => item.kind === "file",
      )
      if (hasFileItems) return true

      const types = dataTransfer.types
      if (!types) return false

      const typeList = Array.from(types)
      return (
        typeList.includes("Files") ||
        typeList.includes("public.file-url") ||
        typeList.includes("application/x-moz-file")
      )
    }

    const resetDragging = () => {
      dragCounterRef.current = 0
      setIsDraggingFiles(false)
    }

    const handleDragEnter = (event: DragEvent) => {
      if (!isFileDragEvent(event)) return

      if (isInNewSubtree) return

      dragCounterRef.current += 1
      setIsDraggingFiles(true)
    }

    const handleDragLeave = (event: DragEvent) => {
      if (!isFileDragEvent(event)) return

      if (isInNewSubtree) return

      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
      if (dragCounterRef.current === 0) {
        setIsDraggingFiles(false)
      }
    }

    const handleDragOver = (event: DragEvent) => {
      if (!isFileDragEvent(event)) return

      // /new配下では投稿UIのdropzoneに任せるが、ブラウザがファイルを開く既定動作は防ぐ
      event.preventDefault()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy"
      }

      if (isInNewSubtree) return
    }

    const handleDrop = (event: DragEvent) => {
      if (!isFileDragEvent(event)) return

      if (isInNewSubtree) {
        // 投稿画面側のdropzoneで処理させる（ただしブラウザがファイルを開く挙動は抑止）
        event.preventDefault()
        resetDragging()
        return
      }

      resetDragging()

      const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
        f.type.startsWith("image/"),
      )

      if (files.length === 0) return

      // ブラウザがファイルを開いてしまうのを防ぐ
      event.preventDefault()

      // 他のdropハンドラ（各ページ内のdropzone等）と競合しないようにする
      event.stopPropagation()
      ;(
        event as unknown as { stopImmediatePropagation?: () => void }
      ).stopImmediatePropagation?.()

      // 既に投稿画面なら、その場のドロップゾーンに任せる
      if (/\/new\/image($|\?)/.test(location.pathname)) {
        return
      }

      stashDroppedImageFiles(files)

      // dropイベント処理中のDOM更新競合を避けるため、遷移は次tickで行う
      setTimeout(() => {
        navigate(getDropTargetPath(location.pathname))
      }, 0)
    }

    document.addEventListener("dragenter", handleDragEnter, true)
    document.addEventListener("dragleave", handleDragLeave, true)
    document.addEventListener("dragover", handleDragOver, true)
    document.addEventListener("drop", handleDrop, true)
    document.addEventListener("dragend", resetDragging, true)
    document.addEventListener("dragexit", resetDragging, true)
    return () => {
      document.removeEventListener("dragenter", handleDragEnter, true)
      document.removeEventListener("dragleave", handleDragLeave, true)
      document.removeEventListener("dragover", handleDragOver, true)
      document.removeEventListener("drop", handleDrop, true)
      document.removeEventListener("dragend", resetDragging, true)
      document.removeEventListener("dragexit", resetDragging, true)
    }
  }, [location.pathname, navigate])

  if (
    typeof document !== "undefined" &&
    typeof import.meta.env.VITE_SENTRY_DSN === "string"
  ) {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
      tracesSampleRate: 0.001,
      enabled: import.meta.env.PROD,
    })
  }

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={cn("margin-0 min-h-screen font-sans antialiased")}
        style={{ margin: "0 !important" }}
      >
        <ThemeProvider
          defaultTheme={"system"}
          themes={[
            "system",
            "dark",
            "light",
            "light-gray",
            "dark-gray",
            "light-red",
            "dark-red",
            "light-pink",
            "dark-pink",
            "light-orange",
            "dark-orange",
            "light-green",
            "dark-green",
            "light-blue",
            "dark-blue",
            "light-yellow",
            "dark-yellow",
            "light-violet",
            "dark-violet",
          ]}
          enableSystem
          enableColorScheme
          disableTransitionOnChange
          attribute="data-theme"
          storageKey="aipictors-theme"
        >
          {" "}
          <ContextProviders>
            <PhotoProvider maskOpacity={0.7}>{props.children}</PhotoProvider>
          </ContextProviders>
        </ThemeProvider>

        {isDraggingFiles && (
          <div className="pointer-events-none fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-clear-bright-blue opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-20 w-20 text-white opacity-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
          </div>
        )}

        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App(): React.ReactNode {
  const [isMounted, setIsMounted] = useState(false)

  // クライアントサイドのみでパフォーマンス監視を有効にする
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <Outlet />
      {/* SSR時は非表示、クライアントサイドでのみ表示 */}
      {isMounted && (
        <>
          <Suspense fallback={null}>
            <AppAnalytics />
          </Suspense>
          <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense>
        </>
      )}
      <ProgressBar />
    </>
  )
}
