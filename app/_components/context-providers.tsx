import { AuthContextProvider } from "@/_components/auth-context-provider"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import { ApolloProvider } from "@apollo/client/index.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, onMessage } from "firebase/messaging"
type Props = {
  children: React.ReactNode
}

const client = createClient()

const queryClient = new QueryClient()

export const ContextProviders = (props: Props) => {
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

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(config.firebaseConfig)
  initializeAnalytics(getApp())
  try {
    getMessaging(getApp())
    onMessage(getMessaging(), (payload) => {
      console.log(payload)
      navigator.serviceWorker.ready.then((registration) => {
        console.log(registration)
        const notificationOptions = {
          body: payload.data.body,
          icon: payload.data.icon,
          image: payload.data.imageUrl,
          data: payload.data,
        }

        registration.showNotification(payload.data.title, notificationOptions)
      })
    })
  } catch (error) {
    console.error(error)
  }
}
