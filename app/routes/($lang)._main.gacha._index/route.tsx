import type { MetaFunction } from "@remix-run/cloudflare"
import { SpecialGachaPage } from "~/routes/($lang)._main.gacha._index/components/special-gacha-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: "スペシャル枠ガチャ",
      enTitle: "Special Frame Gacha",
      description:
        "ここでしか手に入らないアイコン枠・ヘッダー枠のガチャ。10 連は SR 以上 1 枠確定、200 回引くと好きな枠と交換できます。毎日 1 回目はお得。",
      enDescription:
        "Gacha for exclusive avatar and header frames. 10-pulls guarantee SR or higher, and every 200 pulls you can pick any frame.",
      image: "https://www.aipictors.com/images/gacha/special-gacha-banner.webp",
    },
    undefined,
    props.params.lang,
  )

export default function GachaRoute() {
  return <SpecialGachaPage />
}
