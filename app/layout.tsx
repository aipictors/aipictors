import "@/app/globals.css"
import "@splidejs/react-splide/css/core"

import { RootProviders } from "@/app/_components/root-providers"
import { Toaster } from "@/components/ui/sonner"
import { Config } from "@/config"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import Script from "next/script"

type Props = {
  children: React.ReactNode
}

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
})

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
          notoSansJp.variable,
        )}
      >
        <RootProviders>
          {props.children}
          <Toaster />
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
