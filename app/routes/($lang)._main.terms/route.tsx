import type { MetaFunction } from "@remix-run/cloudflare"
import text from "~/assets/terms.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.TERNS)
}

export default function Terms() {
  return (
    <>
      <div className="w-full space-y-8 py-8">
        <h1 className="font-bold text-2xl">{"利用規約"}</h1>
        <AppMarkdown>{text}</AppMarkdown>
      </div>
    </>
  )
}
