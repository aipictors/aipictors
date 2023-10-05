import type { Metadata } from "next"
import { Providers } from "app/providers"
import { Config } from "config"

type Props = {
  children: React.ReactNode
}

const RootLayout: React.FC<Props> = (props) => {
  const mPlus1p =
    "https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@500;700&display=swap"

  const pixelifySans =
    "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@700&display=swap"

  return (
    <html lang={"ja"}>
      <head>
        <link rel={"preconnect"} href={"https://fonts.googleapis.com"} />
        <link
          rel={"preconnect"}
          href={"https://fonts.gstatic.com"}
          crossOrigin={""}
        />
        <link href={mPlus1p} rel={"stylesheet"} />
        <link href={pixelifySans} rel="stylesheet" />
      </head>
      <body>
        <Providers>{props.children}</Providers>
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
