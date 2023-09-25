import type { Metadata } from "next"
import type { DailyThemesQuery } from "__generated__/apollo"
import { DailyThemesDocument } from "__generated__/apollo"
import { SensitiveThemeList } from "app/(main)/themes/components/ThemeList"
import { client } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: {
    year: string
    month: string
  }
}

const SensitiveMonthThemesPage = async (props: Props) => {
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
    <MainPage>
      <SensitiveThemeList
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

export default SensitiveMonthThemesPage
