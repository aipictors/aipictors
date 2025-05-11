import { loaderClient } from "~/lib/loader-client"
import type { MetaFunction } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ThemeListItemFragment } from "~/routes/($lang)._main.themes._index/components/theme-list"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { getJstDate } from "~/utils/jst-date"
import { ThemeContainer } from "~/routes/($lang)._main.themes._index/components/theme-container"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

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
            ratings: ["G", "R15"],
            orderBy: "DATE_CREATED",
            isNowCreatedAt: true,
          },
        },
      })
    : null

  const getJSTDate = (date: Date) => {
    const offsetJST = 9 * 60 // JST は UTC +9 時間
    const utcDate = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const jstDate = new Date(utcDate + offsetJST * 60 * 1000)
    return jstDate
  }

  const jstStartDate = getJSTDate(new Date(today.setDate(today.getDate() + 1)))

  const jstEndDate = getJSTDate(new Date(today.setDate(today.getDate() + 7)))

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

  const sevenDaysAgo = new Date(
    Number(todayYear),
    Number(todayMonth) - 1,
    Number(todayDay),
  )

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1)

  const sevenDaysAfter = new Date(
    Number(todayYear),
    Number(todayMonth) - 1,
    Number(todayDay),
  )

  sevenDaysAfter.setDate(sevenDaysAgo.getDate() + 8)
  sevenDaysAfter.setHours(sevenDaysAgo.getHours() + 9)

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

  return {
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
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.THEMES, undefined, props.params.lang)
}

export default function Themes() {
  return (
    <>
      <ThemeContainer
        dailyThemes={data.dailyThemes}
        todayTheme={data.todayTheme}
        works={data.works ? data.works : []}
        afterSevenDayThemes={data.afterSevenDayThemes}
        dailyBeforeThemes={data.dailyBeforeThemes}
        worksCount={data.worksCount ? data.worksCount : 0}
        page={data.page}
        year={data.year}
        month={data.month}
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
