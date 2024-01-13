"use client"

import RootError from "@/app/error"
import type { Metadata } from "next"

const RootGlobalError = () => {
  const fontURL =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&display=swap"

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
        <link href={"/icon.svg"} rel={"icon"} type={"image/svg+xml"} />
      </head>
      <body>
        <RootError />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "エラー",
}

export default RootGlobalError
