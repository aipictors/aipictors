"use client"

import RootError from "@/app/error"
import type { Metadata } from "next"

const RootGlobalError = () => {
  return (
    <html lang={"ja"}>
      <head>
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
