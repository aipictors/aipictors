import text from "~/assets/flutter/terms.md?raw"

import { json } from "react-router"
import { AppMarkdown } from "~/components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"
import { config } from "~/config"

export default function FlutterTermsPage() {
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
  return [{ name: "robots", content: "noindex" }, { title: "利用規約" }]
}
