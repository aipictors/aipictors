import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config } from "~/config"
import { RoadmapPage } from "~/routes/($lang)._main.roadmap._index/components/roadmap-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "開発ロードマップ - Aipictors",
      description:
        "AIpictorsの開発ロードマップ。新機能の追加や改善を継続的に行っています。",
      ogp: {
        title: "AIpictors 開発ロードマップ",
        description: "AIpictorsの今後の開発予定をご紹介します。",
      },
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

/**
 * 開発ロードマップページ
 */
export default function Roadmap () {
  return <RoadmapPage />
}
