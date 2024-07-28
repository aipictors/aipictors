import { AppLoadingPage } from "~/components/app/app-loading-page"
import { RecommendedBanner } from "~/routes/($lang).my._index/components/recommended-banner"
import { RecommendedListContainer } from "~/routes/($lang).my._index/components/recommended-list-container"
import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { Suspense } from "react"
import { passFieldsFragment } from "~/graphql/fragments/pass-fields"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - 推薦"

  const metaDescription = "ダッシュボード - 推薦"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export default function MyRecommended() {
  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const passData = pass?.viewer?.currentPass

  const isStandardOrPremium =
    passData?.type === "STANDARD" || passData?.type === "PREMIUM"

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <RecommendedListContainer />
      </Suspense>
      {!isStandardOrPremium && <RecommendedBanner />}
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)
