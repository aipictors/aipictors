import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { GenerationAboutPage } from "~/routes/($lang)._main.generation.about/components/generation-about-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.GENERATION_ABOUT,
    {
      url: "https://assets.aipictors.com/generation-thumbnail-3_11zon.webp",
    },
    props.params.lang,
  )
}

/**
 * 画像生成・LP
 */
export default function GenerationAbout() {
  return <GenerationAboutPage />
}
