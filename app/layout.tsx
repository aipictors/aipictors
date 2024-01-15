import "@/app/globals.css"
import "@splidejs/react-splide/css/core"
import Head from "next/head"

import { RootProviders } from "@/app/_components/root-providers"
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
      <Head>
        <title>{Config.siteTitleJA}</title>
        <meta name="description" content={Config.siteDescriptionJA} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2116548824296763"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {/* 他のメタタグやリンクもここに追加 */}
      </Head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          notoSansFont.variable,
        )}
      >
        <RootProviders>
          {props.children}
          <Toaster />
          <Suspense fallback={null}>
            <AppAnalytics />
          </Suspense>
        </RootProviders>
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
