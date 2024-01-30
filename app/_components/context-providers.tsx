"use client"

import { AuthContextProvider } from "@/app/_components/auth-context-provider"
import { createClient } from "@/app/_contexts/client"
import { ImageGenerationContext } from "@/app/_contexts/image-generation-context"
import { AppThemeProvider } from "@/components/app/app-theme-provider"
import { Config } from "@/config"
import { ApolloProvider } from "@apollo/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"

type Props = {
  children: React.ReactNode
}

const client = createClient()

const queryClient = new QueryClient()

export const ContextProviders = (props: Props) => {
  return (
    <AppThemeProvider>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={client}>
            <ImageGenerationContext.Provider>
              {props.children}
            </ImageGenerationContext.Provider>
          </ApolloProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </AppThemeProvider>
  )
}

// init({
//   dsn: Config.sentryDSN,
//   environment: Config.sentryEnvironment,
//   tracesSampleRate: 1.0,
//   attachStacktrace: true,
//   normalizeDepth: 5,
//   release: Config.sentryRelease,
//   beforeSend(event) {
//     if (Config.isDevelopmentMode) return null
//     return event
//   },
// })

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(Config.firebaseConfig)
  initializeAnalytics(getApp())
}
