import { Metadata } from "next"
import { DailyThemesQuery, DailyThemesDocument } from "__generated__/apollo"
import { AboutTheme } from "app/(main)/themes/[year]/[month]/[day]/components/AboutTheme"
import { client } from "app/client"
import { MainLayout } from "components/MainLayout"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
  searchParams: {}
}

const ThemePage = async (props: Props) => {
  console.log({
    year: props.params.year,
    month: props.params.month,
    day: props.params.day,
  })

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

export default ThemePage
