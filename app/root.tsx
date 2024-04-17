import { AppAnalytics } from "@/_components/app/app-analytics"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { ContextProviders } from "@/_components/context-providers"
import { cn } from "@/_lib/utils"
import type { LinksFunction } from "@remix-run/cloudflare"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { Suspense } from "react"
import { Toaster } from "sonner"
import styles from "./tailwind.css"

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  ]
}

export default function Root() {
  return (
    <html lang={"ja"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("no-margin min-h-screen font-sans antialiased")}>
        <ContextProviders>
          <AutoLoginProvider>
            <Outlet />
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
