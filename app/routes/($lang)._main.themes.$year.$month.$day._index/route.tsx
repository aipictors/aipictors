import { AppPage } from "@/_components/app/app-page"
import { DailyThemesDocument as dailyThemesQuery } from "@/_graphql/__generated__/graphql"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.day === undefined) {
    throw new Response(null, { status: 404 })
  }

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

  return json({
    dailyTheme,
  })
}

/**
 * その日のテーマ一覧
 * @returns
 */
export default function Theme() {
  const params = useParams()

  if (params.year === undefined) {
    throw new Error()
  }

  if (params.month === undefined) {
    throw new Error()
  }

  if (params.day === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <article>
        <h1>{data.dailyTheme.title}</h1>
      </article>
    </AppPage>
  )
}
