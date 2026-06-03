import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"

const PER_PAGE = 32

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "推薦作品一覧",
      enTitle: "Recommended Works",
      description: "ユーザから推薦された作品一覧です。",
      enDescription: "A list of works recommended by users.",
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
})

const getCurrentPage = (searchParams: URLSearchParams) => {
  const rawPage = Number.parseInt(searchParams.get("page") ?? "0", 10)

  if (Number.isNaN(rawPage) || rawPage < 0) {
    return 0
  }

  return rawPage
}

export default function HomeRecommendedRoute() {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = getCurrentPage(searchParams)

  const where = {
    isRecommended: true,
    sort: "DESC" as const,
    ratings: ["G", "R15"] as const,
  }

  const { data, loading } = useQuery(recommendedWorksQuery, {
    variables: {
      offset: currentPage * PER_PAGE,
      limit: PER_PAGE,
      where,
    },
  })

  const { data: countData } = useQuery(recommendedWorksCountQuery, {
    variables: {
      where,
    },
  })

  const works = data?.works ?? []
  const worksCount = countData?.worksCount ?? 0

  const onPageChange = (page: number) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (page === 0) {
      nextSearchParams.delete("page")
    } else {
      nextSearchParams.set("page", page.toString())
    }

    setSearchParams(nextSearchParams)
  }

  if (loading && works.length === 0) {
    return <AppLoadingPage />
  }

  return (
    <div className="space-y-6 pb-10">
      <HomeRecommendedWorkList
        title={t("ユーザからの推薦", "Recommended by users")}
        works={works}
        isCropped={false}
        isShowProfile={true}
        autoPlayVideoPreview={true}
      />

      {works.length === 0 && (
        <div className="rounded-lg border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {t(
            "表示できる推薦作品はまだありません。",
            "There are no recommended works to display yet.",
          )}
        </div>
      )}

      {worksCount > PER_PAGE && (
        <div className="flex justify-center pt-2">
          <ResponsivePagination
            perPage={PER_PAGE}
            maxCount={worksCount}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

const recommendedWorksQuery = graphql(
  `query HomeRecommendedWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomePromotionWork
    }
  }`,
  [HomePromotionWorkFragment],
)

const recommendedWorksCountQuery = graphql(
  `query HomeRecommendedWorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)