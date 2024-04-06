import "@/globals.css"

import { AppAnalytics } from "@/_components/app/app-analytics"
import { AutoLoginProvider } from "@/_components/auto-login-provider"
import { ContextProviders } from "@/_components/context-providers"
import { Toaster } from "@/_components/ui/sonner"
import { cn } from "@/_lib/utils"
import { config } from "@/config"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import NextTopLoader from "nextjs-toploader"
import { Suspense } from "react"
import { notoSansFont } from "./_fonts/noto-sans-font"

export const revalidate = 3600

type Props = {
  children: React.ReactNode
}

const RootLayout = (props: Props) => {
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
          "no-margin min-h-screen font-sans antialiased",
          notoSansFont.variable,
        )}
      >
        <NextTopLoader shadow={false} height={2} />
        <ContextProviders>
          <AutoLoginProvider>
            {props.children}
            <Toaster />
            <Suspense fallback={null}>
              <AppAnalytics />
            </Suspense>
          </AutoLoginProvider>
        </ContextProviders>
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://beta.aipictors.com/"),
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

export default RootLayout
