import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { META } from "~/config"
import { HelpFaqPage } from "~/routes/($lang)._main.help._index/components/help-faq-page"
import { createMeta } from "~/utils/create-meta"

/**
 * よくある質問の一覧（数字の早見表つき）
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
})

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "よくある質問｜使い方ガイド",
      enTitle: "FAQ | User Guide",
      description:
        "Aipictorsのよくある質問。生成の失敗とコイン、プランの解約・二重請求、コインの期限と使われる順、閲覧数の数え方、年齢区分、推し、ログイン、通報など。プラン・コイン・上限の早見表つき。",
      enDescription:
        "Aipictors FAQ: failed generations and coins, cancelling plans and double charges, coin expiry, how views are counted, age ratings, support, login and reporting — with a quick reference of plans, coins and limits.",
      image: META.HELP.image,
      isIndex: true,
    },
    undefined,
    props.params.lang,
  )
}

export default function HelpFaqRoute() {
  return <HelpFaqPage />
}
