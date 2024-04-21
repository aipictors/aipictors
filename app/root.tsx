import styles from "@/tailwind.css?url"

import { AppAnalytics } from "@/_components/app/app-analytics"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AppNotFoundPage } from "@/_components/app/app-not-found-page"
import { ContextProviders } from "@/_components/context-providers"
import { cn } from "@/_lib/utils"
import { config } from "@/config"
import type {
  HeadersFunction,
  LinksFunction,
  MetaFunction,
} from "@remix-run/cloudflare"
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
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { Toaster } from "@/_components/app/app-sonner"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "max-age=120, s-maxage=3600, stale-while-revalidate=2592000, stale-if-error=2592000",
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

  return <AppNotFoundPage />
}

// export async function loader({ request }: LoaderFunctionArgs) {
//   const { getTheme } = await themeSessionResolver(request)

//   return {
//     theme: getTheme(),
//   }
// }

/**
 * remix-themeで使用する
 */
// export default function AppWithProviders() {
//   const data = useLoaderData<typeof loader>()
//   return (
//     <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
//       <App />
//     </ThemeProvider>
//   )
// }

type Props = Readonly<{
  children: React.ReactNode
}>

/**
 * https://remix.run/docs/en/main/file-conventions/root#layout-export
 */
export function Layout(props: Props) {
  if (
    typeof window !== "undefined" &&
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
    <html
      lang={"ja"}
      suppressHydrationWarning
      // className={clsx(theme)}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} /> */}
        <Meta />
        <Links />
      </head>
      <body className={cn("margin-0 min-h-screen font-sans antialiased")}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme={"system"}
          enableSystem
          disableTransitionOnChange
        >
          <ContextProviders>
            <Suspense fallback={<AppLoadingPage />}>{props.children}</Suspense>
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
  // const data = useLoaderData<typeof loader>()

  // const [theme] = useTheme()

  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <AppAnalytics />
      </Suspense>
    </>
  )
}
