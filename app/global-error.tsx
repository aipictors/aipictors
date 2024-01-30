"use client"

import type { Metadata } from "next"

type Props = {
  error: Error & { digest?: string }
  reset(): void
}

export default function RootGlobalError(props: Props) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => props.reset()}>Try again</button>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "エラー",
}
