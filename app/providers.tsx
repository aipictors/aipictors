"use client"
import { ApolloProvider } from "@apollo/client"
import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import { init } from "@sentry/nextjs"
import { getAnalytics, initializeAnalytics, logEvent } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "app/client"
import { AppContextProvider } from "app/components/AppContextProvider"
import { theme } from "app/theme"
import { Config } from "config"

type Props = {
  children: React.ReactNode
}

const client = createClient()

export const Providers: React.FC<Props> = (props) => {
  const pathname = usePathname()

  const searchParams = useSearchParams()

  useEffect(() => {
    if (Config.isNotClient) return
    if (Config.isDevelopmentMode) return
    if (getApps().length === 0) return
    logEvent(getAnalytics(), "page_view", {
      page_path: pathname,
      page_title: pathname,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return (
    <AppContextProvider>
      <ApolloProvider client={client}>
        <CacheProvider>
          <ChakraProvider theme={theme}>{props.children}</ChakraProvider>
        </CacheProvider>
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
