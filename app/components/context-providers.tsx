import { AuthContextProvider } from "~/components/auth-context-provider"
import { AutoLoginProvider } from "~/components/auto-login-provider"
import { createClient } from "~/lib/client"
import { config } from "~/config"
import { ApolloProvider } from "@apollo/client/index"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, onMessage, getToken } from "firebase/messaging"
type Props = {
  children: React.ReactNode
}

const client = createClient()

const queryClient = new QueryClient()

export function ContextProviders  (props: Props)  {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <AuthContextProvider>
          <AutoLoginProvider>{props.children}</AutoLoginProvider>
        </AuthContextProvider>
      </ApolloProvider>
    </QueryClientProvider>
  )
}

if (typeof document !== "undefined" && getApps().length === 0) {
  initializeApp(config.firebaseConfig)
  initializeAnalytics(getApp())
  try {
    getMessaging(getApp())
    onMessage(getMessaging(), (payload) => {
      console.log("onMessage", payload)
      getToken(getMessaging(), {
        vapidKey: config.fcm.vapidKey,
      }).then((token) => {
        navigator.serviceWorker.ready.then((registration) => {
          if (payload.data === undefined) return
          console.log("serviceWorker.ready", payload)
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
    console.error(error)
  }
}
