import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  parsePictorRunShareKey,
  toPictorRunCardUrl,
} from "~/components/pictor-run/pictor-run-share"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { PictorChanProfile } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-profile"
import { createMeta } from "~/utils/create-meta"

/**
 * ミニゲーム「ぴくたーちゃんラン」の結果をシェアするページ。
 * X などに貼ると、得点の入ったカードの画像が出る。中身はぴくたーちゃんのページと同じ（ここからゲームを遊べる）
 */
export const meta: MetaFunction = (props) => {
  const t = useTranslation()
  const result = parsePictorRunShareKey(props.params.result)
  return createMeta(
    {
      title: result
        ? t(
            `ぴくたーちゃんランで ${result.score} 点！`,
            `Scored ${result.score} in Pictor-chan Run!`,
          )
        : t("ぴくたーちゃんラン", "Pictor-chan Run"),
      description: t(
        "Aipictors のマスコット「ぴくたーちゃん」が走るミニゲーム。ジャンプで障害物をよけて、13 のステージを走りぬけよう。無料ですぐ遊べます。",
        "A mini game starring Pictor-chan, the Aipictors mascot. Jump over obstacles and run through 13 stages. Free to play.",
      ),
      ...(result && { image: toPictorRunCardUrl(result) }),
      // 結果ごとに無数にできるページなので、検索には出さない
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

export default function PictorChanRunResult() {
  return <PictorChanProfile />
}
