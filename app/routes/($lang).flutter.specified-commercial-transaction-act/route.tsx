import type { MetaFunction } from "@remix-run/cloudflare"

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

export const meta: MetaFunction = () => {
  return [
    { name: "robots", content: "noindex" },
    { title: "特定商取引法に基づく表記" },
  ]
}
