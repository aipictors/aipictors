import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import {
  PICTOR_RUN_FAQ,
  PictorRunLanding,
} from "~/routes/($lang)._main.pictor-chan.run._index/components/pictor-run-landing"
import { createMeta } from "~/utils/create-meta"

const PAGE_URL = "https://www.aipictors.com/pictor-chan/run"
const IMAGE_URL = "https://www.aipictors.com/images/pictor-chan/run/ogp-2.jpg"

/**
 * ミニゲーム「ぴくたーちゃんラン」のページ（/pictor-chan/run）。
 * 検索や SNS から来た人が、ここからすぐ遊べる
 */
export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title:
        "ぴくたーちゃんラン｜無料で遊べる 3D ランゲーム（ブラウザ・スマホ対応）",
      enTitle: "Pictor-chan Run | Free 3D Runner Game in Your Browser",
      description:
        "ぴくたーちゃんランは、Aipictors のマスコット「ぴくたーちゃん」が走る無料のブラウザゲームです。インストールも登録もなしで、スマホや PC ですぐ遊べます。ジャンプで障害物をよけて全 15 ステージを走り、ランキングやロビーでみんなと遊べます。",
      enDescription:
        "Pictor-chan Run is a free 3D runner game starring the Aipictors mascot. No install or sign-up. Run 15 stages and meet others in the lobby.",
      image: IMAGE_URL,
      // 記事ではなく、ゲームそのもののページ（og:type = website）
      isTop: true,
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

export default function PictorRunPage() {
  const t = useTranslation()
  return (
    <>
      <AppJsonLdScript
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: t("ぴくたーちゃんラン", "Pictor-chan Run"),
            alternateName: ["Pictor-chan Run", "ぴくたーちゃんラン"],
            url: PAGE_URL,
            image: IMAGE_URL,
            description: t(
              "Aipictors のマスコット「ぴくたーちゃん」が走る、無料の 3D ランゲーム。ブラウザですぐ遊べます。",
              "A free 3D runner game starring Pictor-chan, the Aipictors mascot. Play instantly in your browser.",
            ),
            genre: ["Endless runner", "Casual"],
            gamePlatform: ["Web browser", "PC", "Mobile"],
            applicationCategory: "Game",
            operatingSystem: "Any",
            playMode: ["SinglePlayer", "MultiPlayer"],
            inLanguage: ["ja", "en"],
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
            publisher: {
              "@type": "Organization",
              name: "Aipictors",
              url: "https://www.aipictors.com",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PICTOR_RUN_FAQ.map((item) => ({
              "@type": "Question",
              name: t(item.q[0], item.q[1]),
              acceptedAnswer: {
                "@type": "Answer",
                text: t(item.a[0], item.a[1]),
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Aipictors",
                item: "https://www.aipictors.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: t("ぴくたーちゃん", "Pictor-chan"),
                item: "https://www.aipictors.com/pictor-chan",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: t("ぴくたーちゃんラン", "Pictor-chan Run"),
                item: PAGE_URL,
              },
            ],
          },
        ]}
      />
      <PictorRunLanding />
    </>
  )
}
