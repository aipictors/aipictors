import text from "~/assets/flutter/terms.md?raw"
import enText from "~/assets/flutter/terms-en.md?raw"

import { json } from "@remix-run/react"
import { AppMarkdown } from "~/components/app/app-markdown"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"

/**
 * 利用規約
 */
export default function Route() {
  const t = useTranslation()

  return (
    <div className="container-shadcn-ui space-y-8 px-8 py-8">
      <h1 className="font-bold text-2xl">{t("利用規約", "Terns")}</h1>
      <AppMarkdown>{t(text, enText)}</AppMarkdown>
    </div>
  )
}

export async function loader() {
  return json({}, { headers: { "Cache-Control": config.cacheControl.oneDay } })
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.TERMS, undefined, props.params.lang)
}
