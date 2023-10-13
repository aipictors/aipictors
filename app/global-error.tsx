"use client"
import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import type { Metadata } from "next"
import RootError from "app/error"
import { theme } from "app/theme"

const RootGlobalError: React.FC = () => {
  const fontURL =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&display=swap"

  return (
    <html>
      <head>
        <link rel={"preconnect"} href={"https://fonts.googleapis.com"} />
        <link
          rel={"preconnect"}
          href={"https://fonts.gstatic.com"}
          crossOrigin={""}
        />
        <link href={fontURL} rel={"stylesheet"} />
        <link href={"/icon.svg"} rel={"icon"} type={"image/svg+xml"} />
      </head>
      <body>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            <RootError />
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "エラー",
}

export default RootGlobalError
