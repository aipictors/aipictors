import type { DailyThemesQuery } from "__generated__/apollo"
import { DailyThemesDocument } from "__generated__/apollo"
import { ThemeHeader } from "app/[lang]/(main)/themes/_components/theme-header"
import { ThemeList } from "app/[lang]/(main)/themes/_components/theme-list"
import { MainPage } from "app/_components/page/main-page"
import { createClient } from "app/_contexts/client"
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

  return (
    <MainPage>
      <ThemeHeader />
      <ThemeList
        year={year}
        month={month}
        dailyThemesQuery={dailyThemesQuery.data}
      />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemesPage
