import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import {
  ThemeList,
  ThemeListItemFragment,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { ThemeWorksList } from "~/routes/($lang)._main.themes._index/components/theme-works-list"
import { Separator } from "~/components/ui/separator"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const dailyThemesResp = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year: year, month: month },
    },
  })

  const today = new Date()

  const todayYear = today.getFullYear()

  const todayMonth = today.getMonth() + 1

  const todayDay = today.getDate()

  const todayThemesResp = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 32,
      where: { year: todayYear, month: todayMonth, day: todayDay },
    },
  })

  const worksResp = todayThemesResp.data.dailyThemes.length
    ? await client.query({
        query: themeWorksQuery,
        variables: {
          offset: 0,
          limit: 32,
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

  const afterSevenDayThemesResp = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 7,
      where: { startDate, endDate },
    },
  })

  return json({
    dailyThemes: dailyThemesResp.data.dailyThemes,
    todayTheme: todayThemesResp.data.dailyThemes.length
      ? todayThemesResp.data.dailyThemes[0]
      : null,
    works: worksResp ? worksResp.data.works : null,
    afterSevenDayThemes: afterSevenDayThemesResp.data.dailyThemes,
  })
}

/**
 * その月のテーマ一覧
 */
export default function MonthThemes() {
  const params = useParams()

  if (params.year === undefined) {
    throw new ParamsError()
  }

  if (params.month === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。"

  return (
    <>
      <AppPageHeader title={"お題"} description={description} />
      <ThemeWorksList
        todayTheme={data.todayTheme}
        works={data.works}
        isSensitive={false}
        afterThemes={data.afterSevenDayThemes}
      />
      <Separator />
      <ThemeList year={year} month={month} dailyThemes={data.dailyThemes} />
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
  }`,
  [ThemeWorkFragment],
)
