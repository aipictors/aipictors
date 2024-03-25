import { AppPage } from "@/components/app/app-page"
import { DailyThemesDocument as dailyThemesQuery } from "@/graphql/__generated__/graphql"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

const ThemePage = async (props: Props) => {
  const client = createClient()

  const dailyThemesResp = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 1,
      where: {
        year: Number.parseInt(props.params.year),
        month: Number.parseInt(props.params.month),
        day: Number.parseInt(props.params.day),
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

export default ThemePage
