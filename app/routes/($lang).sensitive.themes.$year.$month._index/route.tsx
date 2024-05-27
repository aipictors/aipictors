import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import { ThemeList } from "@/routes/($lang)._main.themes._index/_components/theme-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined || props.params.month === undefined) {
    throw new Response("Invalid date", { status: 400 })
  }

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

  return json({
    dailyThemes: dailyThemesResp.data.dailyThemes,
  })
}

export default function SensitiveMonthThemesPage() {
  const data = useLoaderData<typeof loader>()

  const params = useParams()

  if (params.year === undefined || params.month === undefined) {
    throw new ParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  return (
    <AppPage>
      <ThemeList year={year} month={month} dailyThemes={data.dailyThemes} />
    </AppPage>
  )
}
