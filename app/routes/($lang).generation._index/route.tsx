import type { HeadersFunction } from "@remix-run/cloudflare"
import { config } from "~/config"
import { GenerationPage } from "~/routes/($lang).generation._index/components/generation-page"
import { GenerationSeoSection } from "~/routes/($lang).generation._index/components/generation-seo-section"
import { GENERATION_ENTRY_REDIRECT_SCRIPT } from "~/routes/($lang).generation._index/utils/generation-simple-entry"

/**
 * 画像生成
 */
export default function GenerationIndexPage() {
  return (
    <>
      {/* はじめての人は JS を待たずに /generation/home へ（画面内の移動で来たときは動かず、useGenerationEntryMode が移す） */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 固定の文字列
        dangerouslySetInnerHTML={{ __html: GENERATION_ENTRY_REDIRECT_SCRIPT }}
      />
      <GenerationPage layout="classic" withEntry />
      <GenerationSeoSection />
    </>
  )
}

export const headers: HeadersFunction = ({ parentHeaders }) => ({
  // 画像生成のメンテナンス中は親（生成画面の枠）が no-store にする
  "Cache-Control":
    parentHeaders.get("Cache-Control") === "no-store"
      ? "no-store"
      : config.cacheControl.short,
})
