"use client"

import { Button } from "@/components/ui/button"
import { captureException } from "@sentry/nextjs"
import type { Metadata } from "next"
import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset(): void
}

export default function RootGlobalError(props: Props) {
  useEffect(() => {
    captureException(props.error)
  }, [props.error])

  return (
    <html lang="ja">
      <body>
        <h2>Something went wrong!</h2>
        <Button onClick={() => props.reset()}>Try again</Button>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "エラー",
}
