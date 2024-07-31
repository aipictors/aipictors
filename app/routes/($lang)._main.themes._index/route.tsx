import { AppPageHeader } from "~/components/app/app-page-header"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { ThemeHeader } from "~/routes/($lang)._main.themes._index/components/theme-header"
import { ThemeList } from "~/routes/($lang)._main.themes._index/components/theme-list"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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

  return json({
    dailyThemes: dailyThemesResp.data.dailyThemes,
    year,
    month,
  })
}

export default function Themes() {
  const data = useLoaderData<typeof loader>()

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう。午前0時に更新されます。"

  return (
    <>
      <AppPageHeader title={"創作アイディアページ"} description={description} />
      <ThemeHeader />
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
      id
      title
      dateText
      year
      month
      day
      worksCount
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
