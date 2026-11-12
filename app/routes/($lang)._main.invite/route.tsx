import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config } from "~/config"
import { InvitePage } from "~/routes/($lang)._main.invite/components/invite-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "友だちを招待してフリーコインをもらおう",
      enTitle: "Invite friends and earn free coins",
      description:
        "Aipictors の紹介特典。あなたの紹介リンクから登録した友だちにフリーコイン300枚、友だちがはじめて生成・投稿するとあなたに300枚、プランに加入すると2,000枚。",
      enDescription:
        "Aipictors invite program. Friends who sign up from your link get 300 free coins. You get 300 when they first generate or post, and 2,000 when they join a plan.",
      // 紹介リンク（?ref=）ごとのページが検索に並ばないように
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

/**
 * 紹介コードはブラウザで読む（ページは URL ごとにキャッシュされるので、?ref= でサーバーの描画を変えない）
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

/**
 * 紹介特典のページ
 */
export default function Invite() {
  return <InvitePage />
}
