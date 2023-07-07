"use client"
import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import { init } from "@sentry/nextjs"
import { initializeAnalytics } from "firebase/analytics"
import { getApp, getApps, initializeApp } from "firebase/app"
import { FC, ReactNode } from "react"
import { theme } from "app/theme"
import { Config } from "config"

type Props = {
  children: ReactNode
}

export const Providers: FC<Props> = (props) => {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{props.children}</ChakraProvider>
    </CacheProvider>
  )
}

init({ dsn: Config.sentryDSN })

if (typeof window !== "undefined" && getApps().length === 0) {
  initializeApp(Config.firebaseConfig)
  initializeAnalytics(getApp())
}
