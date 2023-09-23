import type { Metadata } from "next"
import type { DailyThemesQuery } from "__generated__/apollo"
import { DailyThemesDocument } from "__generated__/apollo"
import { AboutTheme } from "app/(main)/themes/[year]/[month]/[day]/components/AboutTheme"
import { client } from "app/client"
import { MainLayout } from "app/components/MainLayout"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

const SensitiveThemePage = async (props: Props) => {
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
    <MainLayout>
      <AboutTheme title={dailyTheme.title} />
    </MainLayout>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveThemePage
