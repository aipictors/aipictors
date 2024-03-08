"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { AuthContextProvider } from "@/app/_components/auth-context-provider"
import { AppThemeProvider } from "@/components/app/app-theme-provider"
import { config } from "@/config"
import { AuthProvider } from "@/lib/auth/components/auth-provider"
import { createClient } from "@/lib/client"
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
      <AuthProvider>
        <AuthContextProvider>
          <QueryClientProvider client={queryClient}>
            <ApolloProvider client={client}>
              <GenerationConfigContext.Provider>
                {props.children}
              </GenerationConfigContext.Provider>
            </ApolloProvider>
          </QueryClientProvider>
        </AuthContextProvider>
      </AuthProvider>
    </AppThemeProvider>
  )
}

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(config.firebaseConfig)
  initializeAnalytics(getApp())
}
