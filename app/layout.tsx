import { FC, ReactNode } from "react"
import { Providers } from "app/providers"
import { Config } from "config"

type Props = {
  children: ReactNode
}

const RootLayout: FC<Props> = (props) => {
  const fontURL =
    "https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@500;700&display=swap"

  return (
    <html lang={"ja"}>
      <head>
        <link rel={"preconnect"} href={"https://fonts.googleapis.com"} />
        <link
          rel={"preconnect"}
          href={"https://fonts.gstatic.com"}
          crossOrigin={""}
        />
        <link href={fontURL} rel={"stylesheet"} />
      </head>
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: "Aipictors",
  description: Config.siteDescriptionJA,
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@aipictors",
  },
}

export default RootLayout
