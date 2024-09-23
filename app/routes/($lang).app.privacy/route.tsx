import text from "~/assets/flutter/privacy.md?raw"
import enText from "~/assets/flutter/privacy-en.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import { json, type MetaFunction } from "@remix-run/react"

/**
 * プライバシー・ポリシー
 */
export default function Route() {
  const t = useTranslation()

  return (
    <div className="container-shadcn-ui space-y-8 px-8 py-8">
      <h1 className="font-bold text-2xl">
        {t("プライバシー・ポリシー", "Privacy Policy")}
      </h1>
      <AppMarkdown>{t(text, enText)}</AppMarkdown>
    </div>
  )
}

export async function loader() {
  return json({}, { headers: { "Cache-Control": config.cacheControl.oneDay } })
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.PRIVACY, undefined, props.params.lang)
}
