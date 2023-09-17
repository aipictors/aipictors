import { Metadata } from "next"
import { ThemeList } from "./components/ThemeList"
import { DailyThemesQuery, DailyThemesDocument } from "__generated__/apollo"
import { client } from "app/client"
import { MainLayout } from "components/MainLayout"

const ThemesPage = async () => {
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
    <MainLayout>
      <ThemeList
        year={year}
        month={month}
        dailyThemesQuery={dailyThemesQuery.data}
      />
    </MainLayout>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemesPage
