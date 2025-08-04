import { AuthContextProvider } from "~/components/auth-context-provider"
import { AutoLoginProvider } from "~/components/auto-login-provider"
import { config } from "~/config"
import { ApolloProvider } from "@apollo/client/index"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, onMessage, getToken } from "firebase/messaging"
import { apolloClient } from "~/lib/client"
import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export function ContextProviders(props: Props) {
  const [isClientMounted, setIsClientMounted] = useState(false)

  // クライアントサイドでのみマウント状態を管理
  useEffect(() => {
    setIsClientMounted(true)

    // Firebase初期化はクライアントサイドでのみ実行
    if (typeof window !== "undefined" && getApps().length === 0) {
      try {
        initializeApp(config.firebaseConfig)

        // Analyticsの初期化は更に遅延させる
        setTimeout(() => {
          try {
            initializeAnalytics(getApp())
          } catch (error) {
            console.warn("Analytics initialization failed:", error)
          }
        }, 1000)

        // Messagingの初期化も遅延させる
        setTimeout(() => {
          try {
            const messaging = getMessaging(getApp())
            onMessage(messaging, (payload) => {
              getToken(messaging, {
                vapidKey: config.fcm.vapidKey,
              }).then((_token) => {
                navigator.serviceWorker.ready.then((registration) => {
                  if (payload.data === undefined) return
                  registration.showNotification(payload.data.title, {
                    body: payload.data.body,
                    icon: payload.data.icon,
                    data: payload.data,
                    // @ts-ignore
                    image: payload.data.imageUrl,
                    tag: payload.data.tag,
                  })
                })
              })
            })
          } catch (error) {
            console.warn("Messaging initialization failed:", error)
          }
        }, 2000)
      } catch (error) {
        console.error("Firebase initialization failed:", error)
      }
    }
  }, [])

  // SSR時は最小限の構成でレンダリング
  if (!isClientMounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>{props.children}</ApolloProvider>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <AuthContextProvider>
          <AutoLoginProvider>{props.children}</AutoLoginProvider>
        </AuthContextProvider>
      </ApolloProvider>
    </QueryClientProvider>
  )
}
