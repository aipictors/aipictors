import "react-photo-view/dist/react-photo-view.css"
import "@fontsource-variable/m-plus-2"

import { AppAnalytics } from "~/components/app/app-analytics"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AppNotFoundPage } from "~/components/app/app-not-found-page"
import { ContextProviders } from "~/components/context-providers"
import { cn } from "~/lib/utils"
import type { LinksFunction } from "react-router"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLocation,
} from "react-router"
import { init } from "@sentry/browser"
import { ThemeProvider } from "next-themes"
import { Suspense, useEffect, useState } from "react"
import { Toaster } from "~/components/app/app-sonner"
import { PhotoProvider } from "react-photo-view"
import styles from "~/tailwind.css?url"
import { AppErrorPage } from "~/components/app/app-error-page"
import { ProgressBar } from "~/components/progress-bar"

export const links: LinksFunction = () => {
  return [
    // tailwind.cssのロード
    { rel: "stylesheet", href: styles, crossOrigin: "anonymous" },
  ]
}

export function ErrorBoundary() {
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
export function Layout(props: Props) {
  const location = useLocation()
  const [key, setKey] = useState(location.pathname)

  useEffect(() => {
    setKey(location.pathname)
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
    <html lang={"ja"} suppressHydrationWarning>
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
        >
          <ContextProviders>
            <PhotoProvider maskOpacity={0.7}>
              <Suspense fallback={<AppLoadingPage />}>
                {props.children}
              </Suspense>
            </PhotoProvider>
          </ContextProviders>
        </ThemeProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <AppAnalytics />
      </Suspense>
      <ProgressBar />
    </>
  )
}
