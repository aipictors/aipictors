import text from "~/assets/flutter/terms.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import type { HeadersFunction, MetaFunction } from "react-router";
import { config } from "~/config"

export default function FlutterTermsPage() {
  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "利用規約" }]
}
