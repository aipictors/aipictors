import { loaderClient } from "~/lib/loader-client"
import {
  json,
  type MetaFunction,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useLocation,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import { ThemeListItemFragment } from "~/routes/($lang)._main.themes._index/components/theme-list"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { getJstDate } from "~/utils/jst-date"
import { ThemeContainer } from "~/routes/($lang)._main.themes._index/components/theme-container"

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  const dailyThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year: year, month: month },
    },
  })

  const today = getJstDate(new Date())
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const todayThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year: todayYear, month: todayMonth, day: todayDay },
    },
  })

  const worksResp = todayThemesResp.data.dailyThemes.length
    ? await loaderClient.query({
        query: themeWorksQuery,
        variables: {
          offset: 64 * page,
          limit: 64,
          where: {
            subjectId: Number(todayThemesResp.data.dailyThemes[0].id),
            ratings: ["R18", "R18G"],
            orderBy: "DATE_CREATED",
            isNowCreatedAt: true,
          },
        },
      })
    : null

  const jstStartDate = getJstDate(new Date(today.setDate(today.getDate() + 1)))
  const jstEndDate = getJstDate(new Date(today.setDate(today.getDate() + 7)))
  const startDate = jstStartDate.toISOString().split("T")[0]
  const endDate = jstEndDate.toISOString().split("T")[0]

  const afterSevenDayThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 7,
      where: { startDate, endDate },
    },
  })

  const sevenDaysAgo = new Date(todayYear, todayMonth - 1, todayDay)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const sevenDaysAfter = new Date(todayYear, todayMonth - 1, todayDay)
  sevenDaysAfter.setDate(sevenDaysAgo.getDate() + 14)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  const dailyBeforeThemes = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 14,
      where: {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(sevenDaysAfter),
        orderBy: "DATE_STARTED",
        sort: "ASC",
      },
    },
  })

  return json({
    dailyThemes: dailyThemesResp.data.dailyThemes,
    year,
    month,
    todayTheme: todayThemesResp.data.dailyThemes.length
      ? todayThemesResp.data.dailyThemes[0]
      : null,
    works: worksResp ? worksResp.data.works : null,
    afterSevenDayThemes: afterSevenDayThemesResp.data.dailyThemes,
    dailyBeforeThemes: dailyBeforeThemes.data.dailyThemes,
    worksCount: worksResp ? worksResp.data.worksCount : null,
    page,
    themeId: Number(todayThemesResp.data.dailyThemes[0].id),
  })
}

export const meta: MetaFunction = () => {
  return createMeta(META.THEMES)
}

const useUpdateQueryParams = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const updateQueryParams = (newParams: URLSearchParams) => {
    const newUrl = `${location.pathname}?${newParams.toString()}`
    navigate(newUrl, { replace: true })
  }

  return updateQueryParams
}

export default function Themes() {
  const data = useLoaderData<typeof loader>()

  const [searchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  const handleTabChange = (tab: string) => {
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。"

  return (
    <>
      <ThemeContainer
        dailyThemes={data.dailyThemes}
        todayTheme={data.todayTheme}
        works={data.works ?? []}
        afterSevenDayThemes={data.afterSevenDayThemes}
        dailyBeforeThemes={data.dailyBeforeThemes}
        worksCount={data.worksCount ?? 0}
        page={data.page}
        year={data.year}
        month={data.month}
        isSensitive={true}
        themeId={data.themeId}
      />
    </>
  )
}

const dailyThemesQuery = graphql(
  `query DailyThemes(
    $offset: Int!
    $limit: Int!
    $where: DailyThemesWhereInput!
  ) {
    dailyThemes(offset: $offset, limit: $limit, where: $where) {
      ...ThemeListItem
    }
  }`,
  [ThemeListItemFragment],
)

const themeWorksQuery = graphql(
  `query AlbumWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ThemeWork
    }
    worksCount(where: $where)
  }`,
  [ThemeWorkFragment],
)
