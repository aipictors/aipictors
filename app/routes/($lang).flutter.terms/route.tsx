import text from "@/_assets/flutter/terms.md?raw"

import { AppMarkdown } from "@/_components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"

export default function FlutterTermsPage() {
  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "利用規約" }]
}
