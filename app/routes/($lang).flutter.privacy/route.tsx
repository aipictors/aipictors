import text from "~/assets/flutter/privacy.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json } from "react-router"
import { config } from "~/config"

export default function FlutterPrivacyPage() {
  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}
export async function loader() {
  return json({}, { headers: { "Cache-Control": config.cacheControl.home } })
}

export const meta: MetaFunction = () => {
  return [
    { name: "robots", content: "noindex" },
    { title: "プライバシー・ポリシー" },
  ]
}
