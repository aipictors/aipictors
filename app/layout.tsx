import "@/app/globals.css"

import { ContextProviders } from "@/app/_components/context-providers"
import { AppAnalytics } from "@/components/app/app-analytics"
import { Toaster } from "@/components/ui/sonner"
import { config } from "@/config"
import { cn } from "@/lib/utils"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import NextTopLoader from "nextjs-toploader"
import { Suspense } from "react"
import { notoSansFont } from "./_fonts/noto-sans-font"

type Props = {
  children: React.ReactNode
}

const verifyIdToken = async (idToken: string) => {
  const apiKey = config.firebaseConfig.apiKey
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  )
  const json = await resp.json()
  return json
}

const RootLayout = async (props: Props) => {
  return (
    <html lang={"ja"} suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2116548824296763"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased no-margin",
          notoSansFont.variable,
        )}
      >
        <NextTopLoader shadow={false} height={2} />
        <ContextProviders>
          {props.children}
          <Toaster />
          <Suspense fallback={null}>
            <AppAnalytics />
          </Suspense>
        </ContextProviders>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aipictors.com/"),
  title: {
    template: config.metadata.titleTemplateJA,
    default: config.metadata.titleJA,
  },
  description: config.metadata.descriptionJA,
  openGraph: {
    type: "website",
    siteName: config.metadata.titleJA,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@aipictors",
    title: config.metadata.nameJA,
    description: config.metadata.descriptionJA,
  },
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
}

export default RootLayout
