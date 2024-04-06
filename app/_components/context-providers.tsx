"use client"

import { AppThemeProvider } from "@/_components/app/app-theme-provider"
import { AuthContextProvider } from "@/_components/auth-context-provider"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import { ApolloProvider } from "@apollo/client/index.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, onMessage } from "firebase/messaging"
import { toast } from "sonner"

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
          <ApolloProvider client={client}>{props.children}</ApolloProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </AppThemeProvider>
  )
}

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(config.firebaseConfig)
  initializeAnalytics(getApp())
  try {
    getMessaging(getApp())
    onMessage(getMessaging(), (payload) => {
      if (payload.notification === undefined) return
      toast(payload.notification.title, {
        description: payload.notification.body,
      })
    })
  } catch (error) {
    console.error(error)
  }
}
