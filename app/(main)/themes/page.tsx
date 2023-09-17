import type { Metadata } from "next"
import type { DailyThemesQuery} from "__generated__/apollo";
import { DailyThemesDocument } from "__generated__/apollo"
import { ThemeList } from "app/(main)/themes/components/ThemeList"
import { client } from "app/client"
import { MainLayout } from "app/components/MainLayout"

const ThemesPage = async () => {
  const dailyThemesQuery = await client.query<DailyThemesQuery>({
    query: DailyThemesDocument,
    variables: {
      offset: 0,
      limit: 31,
      where: { year: 2023, month: 9 },
    },
  })

  return (
    <MainLayout>
      <ThemeList
        year={2023}
        month={9}
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
