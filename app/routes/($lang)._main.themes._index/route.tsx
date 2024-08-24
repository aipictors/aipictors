import { AppPageHeader } from "~/components/app/app-page-header"
import { createClient } from "~/lib/client"
import { json, type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  ThemeList,
  ThemeListItemFragment,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { ThemeWorksList } from "~/routes/($lang)._main.themes._index/components/theme-works-list"
import { ConstructionAlert } from "~/components/construction-alert"

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
          },
        },
      })
    : null

  return json({
    dailyThemes: dailyThemesResp.data.dailyThemes,
    year,
    month,
    todayTheme: todayThemesResp.data.dailyThemes.length
      ? todayThemesResp.data.dailyThemes[0]
      : null,
    works: worksResp ? worksResp.data.works : null,
  })
}

export const meta: MetaFunction = () => {
  return createMeta(META.THEMES)
}

export default function Themes() {
  const data = useLoaderData<typeof loader>()

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。"

  return (
    <>
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL="https://www.aipictors.com/idea"
      />
      <AppPageHeader title={"お題"} description={description} />
      <ThemeWorksList
        todayTheme={data.todayTheme}
        works={data.works}
        isSensitive={false}
      />
      <ThemeList
        year={data.year}
        month={data.month}
        dailyThemes={data.dailyThemes}
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
