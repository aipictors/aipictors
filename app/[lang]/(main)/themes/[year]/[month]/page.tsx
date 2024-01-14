import type { DailyThemesQuery } from "@/__generated__/apollo"
import { DailyThemesDocument } from "@/__generated__/apollo"
import { ThemeList } from "@/app/[lang]/(main)/themes/_components/theme-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
  }
}

const ThemesPage = async (props: Props) => {
  const client = createClient()

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
    <AppPage>
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
