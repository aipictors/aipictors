import { ThemeList } from "@/[lang]/(main)/themes/_components/theme-list"
import { AppPage } from "@/_components/app/app-page"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
  }
}

const ThemesPage = async (props: Props) => {
  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const dailyThemesResp = await client.query({
    query: dailyThemesQuery,
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
