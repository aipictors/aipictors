import "@/app/globals.css"

import { ContextProviders } from "@/app/_components/context-providers"
import { AppAnalytics } from "@/components/app/app-analytics"
import { Toaster } from "@/components/ui/sonner"
import { Config } from "@/config"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import Script from "next/script"
import { Suspense } from "react"
import { notoSansFont } from "./_fonts/noto-sans-font"

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
          "min-h-screen font-sans antialiased",
          notoSansFont.variable,
        )}
      >
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
    template: Config.siteTitleTemplateJA,
    default: Config.siteTitleJA,
  },
  description: Config.siteDescriptionJA,
  openGraph: {
    type: "website",
    siteName: Config.siteTitleJA,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@aipictors",
    title: Config.siteNameJA,
    description: Config.siteDescriptionJA,
  },
}

export default RootLayout
