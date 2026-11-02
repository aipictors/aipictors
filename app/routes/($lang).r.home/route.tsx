import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { SensitiveHomeIndexPage } from "~/routes/($lang).r._index/route"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export { headers, loader } from "~/routes/($lang).r._index/route"

/** /r の「おすすめ」と同じ内容なので、検索エンジンには /r を載せる */
export const meta: MetaFunction = (props) =>
  createSensitiveMeta(
    { ...META.HOME_SENSITIVE, isIndex: false, isTop: false },
    undefined,
    props.params.lang,
  )

/**
 * R18 のホーム（全年齢の /home にあたる）
 */
export default function SensitiveHomePage() {
  return <SensitiveHomeIndexPage forcedTab="home" />
}
