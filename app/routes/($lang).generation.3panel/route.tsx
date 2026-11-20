import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { GenerationPage } from "~/routes/($lang).generation._index/components/generation-page"
import { createMeta } from "~/utils/create-meta"

/**
 * 試してもらう用（検索には出さない）
 */
export const meta: MetaFunction = (props) => {
  return createMeta(
    { ...META.GENERATION, isIndex: false },
    undefined,
    props.params.lang,
  )
}

export const headers: HeadersFunction = ({ parentHeaders }) => ({
  // 画像生成のメンテナンス中は親（生成画面の枠）が no-store にする
  "Cache-Control":
    parentHeaders.get("Cache-Control") === "no-store"
      ? "no-store"
      : config.cacheControl.short,
})

/**
 * 画像生成（PC は 3 カラム: 左メニュー / 中央 結果・入力 / 右 設定）の試用ページ。
 * はじめての人の入口（/generation/home）には移さず、いつも生成画面を出す。スマホは /generation と同じ
 */
export default function GenerationThreePanelPage() {
  return <GenerationPage layout="threeColumn" withEntry={false} />
}
