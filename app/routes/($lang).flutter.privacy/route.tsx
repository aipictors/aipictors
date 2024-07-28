import text from "~/assets/flutter/privacy.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"

export default function FlutterPrivacyPage() {
  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [
    { name: "robots", content: "noindex" },
    { title: "プライバシー・ポリシー" },
  ]
}
