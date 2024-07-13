import { AppPage } from "@/_components/app/app-page"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { createClient } from "@/_lib/client"
import { ThemeList } from "@/routes/($lang)._main.themes._index/_components/theme-list"
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
    year,
    month,
    dailyThemesResp,
  })
}

export default function SensitiveThemes() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ThemeList
        year={data.year}
        month={data.month}
        dailyThemes={data.dailyThemesResp.data.dailyThemes}
      />
    </AppPage>
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
