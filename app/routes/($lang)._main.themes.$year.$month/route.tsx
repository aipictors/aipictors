import { ThemeList } from "@/[lang]/(main)/themes/_components/theme-list"
import { AppPage } from "@/_components/app/app-page"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
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
  return {
    year,
    month,
    dailyThemes: dailyThemesResp.data.dailyThemes,
  }
}

/**
 * その月のテーマ一覧
 * @returns
 */
export default function MonthThemes() {
  const params = useParams()

  if (params.year === undefined) {
    throw new Error()
  }

  if (params.month === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ThemeList
        year={data.year}
        month={data.month}
        dailyThemes={data.dailyThemes}
      />
    </AppPage>
  )
}
