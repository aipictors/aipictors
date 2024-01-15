import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { DailyThemesQuery } from "@/graphql/__generated__/graphql"
import { dailyThemesQuery } from "@/graphql/queries/daily-theme/daily-themes"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

const SensitiveThemePage = async (props: Props) => {
  const client = createClient()

  const dailyThemesResp = await client.query({
    query: dailyThemesQuery,
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

  const [dailyTheme] = dailyThemesResp.data.dailyThemes

  return (
    <AppPage>
      <article>
        <h1>{dailyTheme.title}</h1>
      </article>
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

export default SensitiveThemePage
