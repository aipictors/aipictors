import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { config } from "~/config"

export default function FlutterSctaPage() {
  return (
    <div className="py-8">
      <div className="flex justify-between">
        <p>{"運営サービス"}</p>
        <p>{"Aipictors"}</p>
      </div>
    </div>
  )
}

export async function loader() {
  return { headers: { "Cache-Control": config.cacheControl.home } }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export const meta: MetaFunction = () => {
  return [
    { name: "robots", content: "noindex" },
    { title: "特定商取引法に基づく表記" },
  ]
}
