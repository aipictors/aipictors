import type { Metadata } from "next"
import type { DailyThemesQuery } from "__generated__/apollo"
import { DailyThemesDocument } from "__generated__/apollo"
import { AboutTheme } from "app/[lang]/(main)/themes/[year]/[month]/[day]/components/AboutTheme"
import { createClient } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

const ThemePage = async (props: Props) => {
  const client = createClient()

  const dailyThemesQuery = await client.query<DailyThemesQuery>({
    query: DailyThemesDocument,
    variables: {
      offset: 0,
      limit: 1,
      where: {
        year: parseInt(props.params.year),
        month: parseInt(props.params.month),
        day: parseInt(props.params.day),
      },
    },
  })

  const [dailyTheme] = dailyThemesQuery.data.dailyThemes

  return (
    <MainPage>
      <AboutTheme title={dailyTheme.title} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ThemePage
