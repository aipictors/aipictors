import text from "~/assets/flutter/terms.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import { AppPageCenter } from "~/components/app/app-page-center"
import { AppFooter } from "~/routes/($lang).app._index/components/app-footer"
import type { MetaFunction } from "@remix-run/cloudflare"

export default function AppTerms() {
  return (
    <>
      <AppPageCenter>
        <div className="space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"利用規約"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
      <AppFooter />
    </>
  )
}

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "利用規約" }]
}
