import { AppLoadingPage } from "~/components/app/app-loading-page"
import { RecommendedBanner } from "~/routes/($lang).my._index/components/recommended-banner"
import { RecommendedListContainer } from "~/routes/($lang).my._index/components/recommended-list-container"
import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { Suspense } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  return createMeta(META.MY_RECOMMENDED)
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
      id
      currentPass {
        id
        type
      }
    }
  }`,
)
