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
import { PictorRunLanding } from "~/routes/($lang)._main.pictor-chan.run._index/components/pictor-run-landing"
import { createMeta } from "~/utils/create-meta"

/**
 * ミニゲーム「ぴくたーちゃんラン」の結果をシェアするページ。
 * X などに貼ると、得点の入ったカードの画像が出る。中身はゲームのページ（/pictor-chan/run）と同じ（ここからゲームを遊べる）
 */
export const meta: MetaFunction = (props) => {
  const t = useTranslation()
  const result = parsePictorRunShareKey(props.params.result)
  const tags = createMeta(
    {
      title: result
        ? t(
            `ぴくたーちゃんランで ${result.score} 点！`,
            `Scored ${result.score} in Pictor-chan Run!`,
          )
        : t("ぴくたーちゃんラン", "Pictor-chan Run"),
      description: t(
        "Aipictors のマスコット「ぴくたーちゃん」が走るミニゲーム。ジャンプで障害物をよけて、15 のステージを走りぬけよう。無料ですぐ遊べます。",
        "A mini game starring Pictor-chan, the Aipictors mascot. Jump over obstacles and run through 15 stages. Free to play.",
      ),
      image: result
        ? toPictorRunCardUrl(result)
        : "https://www.aipictors.com/images/pictor-chan/run/ogp-2.jpg",
      // 結果ごとに無数にできるページなので、検索には出さない
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
  // 画像の大きさを書いておく（取り込む側が、画像を読む前から大きいカードとして扱える）
  return [
    ...tags,
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: result ? "image/png" : "image/jpeg" },
    {
      name: "twitter:image:alt",
      content: t("ぴくたーちゃんランの結果", "Pictor-chan Run result"),
    },
  ]
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

export default function PictorChanRunResult() {
  return <PictorRunLanding />
}
