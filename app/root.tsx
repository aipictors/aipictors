import "react-photo-view/dist/react-photo-view.css"
import "@fontsource-variable/m-plus-2"
import { AppAnalytics } from "~/components/app/app-analytics"
import { AppNotFoundPage } from "~/components/app/app-not-found-page"
import { ContextProviders } from "~/components/context-providers"
import { cn } from "~/lib/utils"
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
} from "@remix-run/react"
import { init } from "@sentry/browser"
import { json } from "@remix-run/cloudflare"
import { ThemeProvider } from "next-themes"
import { Suspense, useEffect, useState, lazy } from "react"
import { Toaster } from "~/components/app/app-sonner"
import { PhotoProvider } from "react-photo-view"
import styles from "~/tailwind.css?url"
import { AppErrorPage } from "~/components/app/app-error-page"
import { ProgressBar } from "~/components/progress-bar"
import { LocaleProvider } from "~/components/locale-provider"
import { getLocaleFromPath } from "~/lib/get-locale-from-path"
import { loadDictionary } from "~/lib/i18n-loader"

const PerformanceMonitor = lazy(() =>
  import("~/components/performance-monitor").then((mod) => ({
    default: mod.PerformanceMonitor,
  })),
)

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles, crossOrigin: "anonymous" },
]

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const pathLocale = getLocaleFromPath(url.pathname)

  // Cookie 取得
  const cookieHeader = props.request.headers.get("Cookie") || ""
  const cookieLocaleMatch = cookieHeader.match(/(?:^|; )locale=(ja|en)(?:;|$)/)
  const cookieLocale = cookieLocaleMatch ? cookieLocaleMatch[1] : null

  // パスにロケール prefix が付いていない場合、Cookie が en なら /en を付けて 301 リダイレクト
  const isPrefixed = /^\/(en)(\/|$)/.test(url.pathname)
  if (!isPrefixed) {
    if (cookieLocale === "en" && pathLocale === "ja") {
      url.pathname = `/en${url.pathname === "/" ? "" : url.pathname}`
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          "Set-Cookie": "locale=en; Path=/; Max-Age=31536000; SameSite=Lax",
        },
      })
    }
  }

  // Cookie が無くパスに en が付いている → Cookie 設定
  const headers: Record<string, string> = {}
  if (cookieLocale === null && pathLocale === "en") {
    headers["Set-Cookie"] = "locale=en; Path=/; Max-Age=31536000; SameSite=Lax"
  }

  // SSR で最低限の辞書 (common) をプリロード
  let commonDict: Record<string, string> = {}
  try {
    const dict = await loadDictionary(pathLocale, "common")
    commonDict = dict.entries
  } catch {}

  return json(
    { locale: pathLocale, dictionaries: { common: commonDict } },
    { headers },
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404)
    return <AppNotFoundPage />
  if (isRouteErrorResponse(error) && 400 < error.status)
    return <AppErrorPage status={error.status} message={error.data} />
  if (error instanceof Error)
    return <AppErrorPage status={500} message={error.message} />
  return <AppNotFoundPage />
}

// 旧 Layout を廃止し SSR で locale を直接反映
export default function Root() {
  const { locale, dictionaries } = useLoaderData<typeof loader>()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sentry 初期化（クライアントのみ）
  useEffect(() => {
    if (typeof document === "undefined") return
    if (typeof import.meta.env.VITE_SENTRY_DSN !== "string") return
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
      tracesSampleRate: 0.001,
      enabled: import.meta.env.PROD,
    })
  }, [])

  return (
    <html lang={locale} suppressHydrationWarning>
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
          <ContextProviders>
            <LocaleProvider initialLocale={locale}>
              <PhotoProvider maskOpacity={0.7}>
                <Outlet />
              </PhotoProvider>
            </LocaleProvider>
          </ContextProviders>
          {isMounted && (
            <div suppressHydrationWarning>
              <Suspense fallback={null}>
                <AppAnalytics />
              </Suspense>
              <Suspense fallback={null}>
                <PerformanceMonitor />
              </Suspense>
            </div>
          )}
          <ProgressBar />
        </ThemeProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        {/* i18n 辞書シード */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: シリアライズ安全な JSON のみ埋め込み
          dangerouslySetInnerHTML={{
            __html: `window.__i18n=${JSON.stringify({ locale, dictionaries })}`,
          }}
        />
      </body>
    </html>
  )
}
