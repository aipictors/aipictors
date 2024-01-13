import type { DailyThemesQuery } from "@/__generated__/apollo"
import { DailyThemesDocument } from "@/__generated__/apollo"
import { ThemeHeader } from "@/app/[lang]/(main)/themes/_components/theme-header"
import { ThemeList } from "@/app/[lang]/(main)/themes/_components/theme-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import { AppPageHeader } from "@/components/app/app-page-header"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

const ThemesPage = async () => {
  const client = createClient()

  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const dailyThemesQuery = await client.query<DailyThemesQuery>({
    query: DailyThemesDocument,
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
        dailyThemes={dailyThemesQuery.data.dailyThemes}
      />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemesPage
