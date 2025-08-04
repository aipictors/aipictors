import { AuthContextProvider } from "~/components/auth-context-provider"
import { AutoLoginProvider } from "~/components/auto-login-provider"
import { config } from "~/config"
import { ApolloProvider } from "@apollo/client/index"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, onMessage, getToken } from "firebase/messaging"
import { apolloClient } from "~/lib/client"

type Props = {
  children: React.ReactNode
}

const queryClient = new QueryClient()

// Firebase設定の遅延初期化
let firebaseInitialized = false

function initializeFirebaseIfNeeded() {
  if (typeof document === "undefined" || firebaseInitialized) return

  try {
    if (getApps().length === 0) {
      initializeApp(config.firebaseConfig)

      // Analyticsは遅延初期化
      requestIdleCallback(() => {
        try {
          initializeAnalytics(getApp())
        } catch (error) {
          console.warn("Analytics initialization failed:", error)
        }
      })

      // Messagingは遅延初期化
      requestIdleCallback(() => {
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
                  // @ts-ignore https://developer.mozilla.org/ja/docs/Web/API/ServiceWorkerRegistration/showNotification#image
                  image: payload.data.imageUrl,
                  tag: payload.data.tag,
                })
              })
            })
          })
        } catch (error) {
          console.warn("Messaging initialization failed:", error)
        }
      })
    }
    firebaseInitialized = true
  } catch (error) {
    console.error("Firebase initialization failed:", error)
  }
}

export function ContextProviders(props: Props) {
  // Firebase初期化を遅延実行
  if (typeof document !== "undefined") {
    initializeFirebaseIfNeeded()
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
