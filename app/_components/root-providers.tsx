"use client"

import { AppContextProvider } from "@/app/_components/app-context-provider"
import { createClient } from "@/app/_contexts/client"

import { Config } from "@/config"
import { ApolloProvider } from "@apollo/client"

import { init } from "@sentry/nextjs"
import { getAnalytics, initializeAnalytics, logEvent } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

const client = createClient()

export const RootProviders = (props: Props) => {
  const pathname = usePathname()

  const searchParams = useSearchParams()

  /**
   * ページビューのイベントを送信する
   */
  useEffect(() => {
    if (Config.isNotClient) return
    if (Config.isDevelopmentMode) return
    if (getApps().length === 0) return
    logEvent(getAnalytics(), Config.logEvent.page_view, {
      page_path: pathname,
      page_title: pathname,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return (
    <AppContextProvider>
      <ApolloProvider client={client}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {props.children}
        </NextThemesProvider>
      </ApolloProvider>
    </AppContextProvider>
  )
}

init({
  dsn: Config.sentryDSN,
  environment: Config.sentryEnvironment,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  normalizeDepth: 5,
  release: Config.sentryRelease,
  beforeSend(event) {
    if (Config.isDevelopmentMode) return null
    return event
  },
})

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(Config.firebaseConfig)
  initializeAnalytics(getApp())
}
