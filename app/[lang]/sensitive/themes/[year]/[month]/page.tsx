import { ThemeList } from "@/app/[lang]/(main)/themes/_components/theme-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { DailyThemesQuery } from "@/graphql/__generated__/graphql"
import { dailyThemesQuery } from "@/graphql/queries/daily-theme/daily-themes"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
  }
}

const SensitiveMonthThemesPage = async (props: Props) => {
  const client = createClient()

  const year = parseInt(props.params.year)

  const month = parseInt(props.params.month)

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

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default SensitiveMonthThemesPage
