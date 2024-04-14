import { AppAnalytics } from "@/_components/app/app-analytics"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { ContextProviders } from "@/_components/context-providers"
import { cn } from "@/_lib/utils"
import styles from "@/globals.css?url"
import type { LinksFunction } from "@remix-run/cloudflare"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { Suspense } from "react"
import { Toaster } from "sonner"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

export default function Root() {
  return (
    <html lang={"ja"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={""}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
          rel="stylesheet"
        />
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
