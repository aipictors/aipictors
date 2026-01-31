import { Turnstile } from "@marsidev/react-turnstile"
import { useEffect, useState } from "react"

export type Status = "error" | "expired" | "solved"

type Props = {
  onStatusChange(status: Status | null): void
}

export default function CloudflareTurnstile (props: Props): React.ReactNode {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    props.onStatusChange(status)
  }, [status, props.onStatusChange])

  // 環境に基づいて siteKey を選択
  const siteKey =
    import.meta.env.NODE_ENV !== "production"
      ? "0x4AAAAAAASZh-Asxvcva-cB"
      : "2x00000000000000000000AB" // テスト用キー: https://developers.cloudflare.com/turnstile/reference/testing/

  return (
    <Turnstile
      siteKey={siteKey}
      onError={() => setStatus("error")}
      onExpire={() => setStatus("expired")}
      onSuccess={() => setStatus("solved")}
      options={{
        size: "invisible",
      }}
    />
  )
}
