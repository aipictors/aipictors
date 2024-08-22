import { createClient } from "~/lib/client"
import {
  ThemeList,
  ThemeListItemFragment,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { ThemeWorksList } from "~/routes/($lang)._main.themes._index/components/theme-works-list"

export async function loader() {
  const client = createClient()

  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

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
      limit: 31,
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
            isSensitive: true,
          },
        },
      })
    : null

  return json({
    year,
    month,
    dailyThemesResp,
    todayTheme: todayThemesResp.data.dailyThemes.length
      ? todayThemesResp.data.dailyThemes[0]
      : null,
    works: worksResp ? worksResp.data.works : null,
  })
}

export default function SensitiveThemes() {
  const data = useLoaderData<typeof loader>()

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。"

  return (
    <>
      <AppPageHeader title={"お題"} description={description} />
      <ThemeWorksList
        todayTheme={data.todayTheme}
        works={data.works}
        isSensitive={true}
      />
      <ThemeList
        year={data.year}
        month={data.month}
        dailyThemes={data.dailyThemesResp.data.dailyThemes}
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
  }`,
  [ThemeWorkFragment],
)
