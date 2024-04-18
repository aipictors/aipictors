import styles from "@/tailwind.css?url"

import { AppAnalytics } from "@/_components/app/app-analytics"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AppNotFoundPage } from "@/_components/app/app-not-found-page"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { ContextProviders } from "@/_components/context-providers"
import { Toaster } from "@/_components/ui/sonner"
import { cn } from "@/_lib/utils"
import { config } from "@/config"
import type {
  HeadersFunction,
  LinksFunction,
  MetaFunction,
} from "@remix-run/cloudflare"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react"
import { init } from "@sentry/browser"
import { Suspense } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "max-age=960, s-maxage=3600, stale-while-revalidate=345600, stale-if-error=345600",
  }
}

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  ]
}

export const meta: MetaFunction = () => {
  return [
    { title: config.metadata.catchphraseJA },
    { desc: config.metadata.descriptionJA },
  ]
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <AppNotFoundPage />
  }
}

export default function Root() {
  if (typeof window !== "undefined") {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN!,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT!,
      tracesSampleRate: 0.001,
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
      <body className={cn("no-margin min-h-screen font-sans antialiased")}>
        <ContextProviders>
          <AutoLoginProvider>
            <Suspense fallback={<AppLoadingPage />}>
              <Outlet />
            </Suspense>
            <Toaster />
            <Suspense fallback={null}>
              <AppAnalytics />
            </Suspense>
          </AutoLoginProvider>
        </ContextProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
