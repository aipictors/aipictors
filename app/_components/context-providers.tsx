"use client"

import { GenerationEditorContext } from "@/app/[lang]/generation/_contexts/generation-editor-context"
import { AuthContextProvider } from "@/app/_components/auth-context-provider"
import { AppThemeProvider } from "@/components/app/app-theme-provider"
import { config } from "@/config"
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
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={client}>
            <GenerationEditorContext.Provider>
              {props.children}
            </GenerationEditorContext.Provider>
          </ApolloProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </AppThemeProvider>
  )
}

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(config.firebaseConfig)
  initializeAnalytics(getApp())
}
