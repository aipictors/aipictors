import "react-photo-view/dist/react-photo-view.css"
import "@fontsource-variable/m-plus-2"

import { AppAnalytics } from "~/components/app/app-analytics"
import { AppNotFoundPage } from "~/components/app/app-not-found-page"
import { ContextProviders } from "~/components/context-providers"
import { cn } from "~/lib/utils"
import type { LinksFunction } from "@remix-run/cloudflare"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLocation,
} from "@remix-run/react"
import { init } from "@sentry/browser"
import { ThemeProvider } from "next-themes"
import { Suspense, useEffect, useState, lazy } from "react"
import { Toaster } from "~/components/app/app-sonner"
import { PhotoProvider } from "react-photo-view"
import styles from "~/tailwind.css?url"
import { AppErrorPage } from "~/components/app/app-error-page"
import { ProgressBar } from "~/components/progress-bar"

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

export function ErrorBoundary (): React.ReactNode {
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
export function Layout (props: Props): React.ReactNode {
  const location = useLocation()
  const [_key, setKey] = useState(
    typeof window !== "undefined" ? location.pathname : "/",
  )

  const htmlLang =
    location.pathname === "/en" || location.pathname.startsWith("/en/")
      ? "en"
      : "ja"

  useEffect(() => {
    if (typeof window !== "undefined") {
      setKey(location.pathname)
    }
  }, [location.pathname])

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
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App (): React.ReactNode {
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
