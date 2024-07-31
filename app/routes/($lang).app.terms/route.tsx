import text from "~/assets/flutter/terms.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"

export default function AppTerms() {
  return (
    <div className="space-y-8 py-8">
      <h1 className="font-bold text-2xl">{"利用規約"}</h1>
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "利用規約" }]
}
