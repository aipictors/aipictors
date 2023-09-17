import { Metadata } from "next"
import { DailyThemesQuery, DailyThemesDocument } from "__generated__/apollo"
import { ThemeList } from "app/(main)/themes/components/ThemeList"
import { client } from "app/client"
import { MainLayout } from "components/MainLayout"

const ThemesPage = async () => {
  const dailyThemesQuery = await client.query<DailyThemesQuery>({
    query: DailyThemesDocument,
    variables: {
      offset: 0,
      limit: 16,
      where: { year: 2023, month: 9 },
    },
  })

  return (
    <MainLayout>
      <ThemeList dailyThemesQuery={dailyThemesQuery.data} />
    </MainLayout>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemesPage
