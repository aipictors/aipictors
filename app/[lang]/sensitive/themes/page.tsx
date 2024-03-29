import { ThemeList } from "@/app/[lang]/(main)/themes/_components/theme-list"
import { AppPage } from "@/components/app/app-page"
import { dailyThemesQuery } from "@/graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

const SensitiveThemesPage = async () => {
  const client = createClient()

  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

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

export default SensitiveThemesPage
