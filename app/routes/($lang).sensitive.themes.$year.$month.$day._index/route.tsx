import { AppPage } from "@/_components/app/app-page"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response("Invalid date", { status: 400 })
  }

  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const dailyThemesResp = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 1,
      where: { year, month, day },
    },
  })

  const [dailyTheme = null] = dailyThemesResp.data.dailyThemes

  if (dailyTheme === null) {
    throw new Response("Not found", { status: 404 })
  }

  return json({ dailyTheme })
}

export default function SensitiveDayThemePage() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <article>
        <h1>{data.dailyTheme.title}</h1>
      </article>
    </AppPage>
  )
}
