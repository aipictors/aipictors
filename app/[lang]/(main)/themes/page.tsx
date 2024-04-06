import { ThemeHeader } from "@/[lang]/(main)/themes/_components/theme-header"
import { ThemeList } from "@/[lang]/(main)/themes/_components/theme-list"
import { AppPage } from "@/_components/app/app-page"
import { AppPageHeader } from "@/_components/app/app-page-header"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

const ThemesPage = async () => {
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

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう。午前0時に更新されます。"

  return (
    <AppPage>
      <AppPageHeader title={"創作アイディアページ"} description={description} />
      <ThemeHeader />
      <ThemeList
        year={year}
        month={month}
        dailyThemes={dailyThemesResp.data.dailyThemes}
      />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default ThemesPage
