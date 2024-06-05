import { AppPage } from "@/_components/app/app-page"
import { AppPageHeader } from "@/_components/app/app-page-header"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import { ThemeHeader } from "@/routes/($lang)._main.themes._index/_components/theme-header"
import { ThemeList } from "@/routes/($lang)._main.themes._index/_components/theme-list"
import { json, useLoaderData } from "@remix-run/react"

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
    <AppPage>
      <AppPageHeader title={"創作アイディアページ"} description={description} />
      <ThemeHeader />
      <ThemeList
        year={data.year}
        month={data.month}
        dailyThemes={data.dailyThemes}
      />
    </AppPage>
  )
}
