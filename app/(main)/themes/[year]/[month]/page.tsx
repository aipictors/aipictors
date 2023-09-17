import { Metadata } from "next"
import { DailyThemesQuery, DailyThemesDocument } from "__generated__/apollo"
import { ThemeList } from "app/(main)/themes/components/ThemeList"
import { client } from "app/client"
import { MainLayout } from "app/components/MainLayout"

type Props = {
  params: {
    year: string
    month: string
  }
}

const ThemesPage = async (props: Props) => {
  const year = parseInt(props.params.year)

  const month = parseInt(props.params.month)

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
