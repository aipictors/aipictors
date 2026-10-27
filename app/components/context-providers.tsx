import { AuthContextProvider } from "~/components/auth-context-provider"
import { AutoLoginProvider } from "~/components/auto-login-provider"
import { config } from "~/config"
import { ApolloProvider } from "@apollo/client/index"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getApp, getApps, initializeApp } from "firebase/app"
import {
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth"
import { apolloClient } from "~/lib/client"
import {
  runAfterLoadIdle,
  withFirebaseAnalytics,
} from "~/utils/run-after-load-idle"

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
      const app = initializeApp(config.firebaseConfig)

      // getAuth() はポップアップ用の iframe（iframe.js・gapi で約 130KB）を最初に読み込むので、
      // ログイン状態の保存先だけ指定して初期化し、ポップアップは使うときに読み込む（social-login-button）
      initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      })

      // Analyticsは読み込み完了後のアイドル時に初期化
      withFirebaseAnalytics(({ initializeAnalytics }) => {
        initializeAnalytics(getApp())
      })

      // Messagingは読み込み完了後のアイドル時に初期化
      runAfterLoadIdle(async () => {
        try {
          const { getMessaging, onMessage, getToken } = await import(
            "firebase/messaging"
          )
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

export function ContextProviders(props: Props): React.ReactNode {
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
