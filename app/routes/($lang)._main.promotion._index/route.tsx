import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { PromotionGuidePage } from "~/routes/($lang)._main.promotion._index/components/promotion-guide-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.PROMOTION, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/**
 * 宣伝枠のご案内（トップの「おすすめ作品」の「あなたの作品も宣伝できます」・プランの比較表・投稿画面から来る）
 */
export default function PromotionGuide() {
  return <PromotionGuidePage />
}
