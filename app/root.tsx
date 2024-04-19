import styles from "@/tailwind.css?url"

import { AppAnalytics } from "@/_components/app/app-analytics"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AppNotFoundPage } from "@/_components/app/app-not-found-page"
import { Toaster } from "@/_components/app/app-sonner"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { ContextProviders } from "@/_components/context-providers"
import { cn } from "@/_lib/utils"
import { config } from "@/config"
import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { init } from "@sentry/browser"
import clsx from "clsx"
import { Suspense } from "react"
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes"
import { themeSessionResolver } from "./sessions.server"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "max-age=960, s-maxage=3600, stale-while-revalidate=345600, stale-if-error=345600",
  }
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)
  return {
    theme: getTheme(),
  }
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}

export function App() {
  const data = useLoaderData<typeof loader>()
  const [theme] = useTheme()
  if (typeof window !== "undefined") {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN!,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT!,
      tracesSampleRate: 0.001,
      enabled: import.meta.env.PROD,
    })
  }

  return (
    <html lang={"ja"} suppressHydrationWarning className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
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
