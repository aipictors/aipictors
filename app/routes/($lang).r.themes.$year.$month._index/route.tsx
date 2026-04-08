import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { ThemeListItemFragment } from "~/routes/($lang)._main.themes._index/components/theme-list"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { getJstDate } from "~/utils/jst-date"
import { SensitiveThemeContainer } from "~/routes/($lang)._main.themes._index/components/sensitive-theme-container"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const today = getJstDate(new Date())

  const todayYear = today.getFullYear()

  const todayMonth = today.getMonth() + 1

  const todayDay = today.getDate()

  const getJSTDate = (date: Date) => {
    const offsetJST = 9 * 60 // JST は UTC +9 時間
    const utcDate = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const jstDate = new Date(utcDate + offsetJST * 60 * 1000)
    return jstDate
  }

  const jstStartDate = getJSTDate(new Date(today.getTime()))
  jstStartDate.setDate(jstStartDate.getDate() + 1)

  const jstEndDate = getJSTDate(new Date(today.getTime()))
  jstEndDate.setDate(jstEndDate.getDate() + 7)

  const startDate = jstStartDate.toISOString().split("T")[0]

  const endDate = jstEndDate.toISOString().split("T")[0]

  const sevenDaysAgo = new Date(
    Number(todayYear),
    Number(todayMonth) - 1,
    Number(todayDay),
  )

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const sevenDaysAfter = new Date(
    Number(todayYear),
    Number(todayMonth) - 1,
    Number(todayDay),
  )

  sevenDaysAfter.setDate(sevenDaysAgo.getDate() + 8)
  sevenDaysAfter.setHours(sevenDaysAgo.getHours() + 9)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  const [dailyThemesResp, todayThemesResp, afterSevenDayThemesResp, dailyBeforeThemes] =
    await Promise.all([
      loaderClient.query({
        query: dailyThemesQuery,
        variables: {
          offset: 0,
          limit: 31,
          where: { year: year, month: month },
        },
      }),
      loaderClient.query({
        query: dailyThemesQuery,
        variables: {
          offset: 0,
          limit: 32,
          where: { year: todayYear, month: todayMonth, day: todayDay },
        },
      }),
      loaderClient.query({
        query: dailyThemesQuery,
        variables: {
          offset: 0,
          limit: 7,
          where: { startDate, endDate },
        },
      }),
      loaderClient.query({
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
      }),
    ])

  const todayTheme = todayThemesResp.data.dailyThemes[0] ?? null
  const subjectId = todayTheme ? Number(todayTheme.id) : null

  const worksResp = subjectId
    ? await loaderClient.query({
        query: themeWorksQuery,
        variables: {
          offset: 64 * page,
          limit: 64,
          where: {
            subjectId,
            ratings: ["R18", "R18G"],
            orderBy: "DATE_CREATED",
            isNowCreatedAt: true,
          },
        },
      })
    : null

  return {
    dailyThemes: dailyThemesResp.data.dailyThemes,
    todayTheme,
    dailyBeforeThemes: dailyBeforeThemes.data.dailyThemes,
    works: worksResp ? worksResp.data.works : null,
    afterSevenDayThemes: afterSevenDayThemesResp.data.dailyThemes,
    worksCount: worksResp ? worksResp.data.worksCount : null,
    page,
    year: year,
    month: month,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * その月のテーマ一覧
 */
export default function MonthThemes () {
  const params = useParams()

  if (params.year === undefined) {
    throw new ParamsError()
  }

  if (params.month === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <SensitiveThemeContainer
        dailyThemes={data.dailyThemes}
        todayTheme={data.todayTheme}
        works={data.works ?? []}
        afterSevenDayThemes={data.afterSevenDayThemes}
        dailyBeforeThemes={data.dailyBeforeThemes}
        worksCount={data.worksCount ?? 0}
        page={data.page}
        year={data.year}
        month={data.month}
        defaultTab={"calender"}
        themeId={data.todayTheme ? Number(data.todayTheme.id) : null}
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
