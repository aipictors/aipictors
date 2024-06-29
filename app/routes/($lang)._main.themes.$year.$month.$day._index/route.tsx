import { Button } from "@/_components/ui/button"
import { AppPage } from "@/_components/app/app-page"
import { dailyThemesQuery } from "@/_graphql/queries/daily-theme/daily-themes"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, json, useParams } from "@remix-run/react"
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

  const year = Number.parseInt(params.year)
  const month = Number.parseInt(params.month)
  const day = Number.parseInt(params.day)
  const tomorrow = new Date(year, month - 1, day)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(year, month - 1, day)
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    <AppPage>
      <article>
        <h1>お題</h1>
        <div className="m-4">
          <p className="text-lg md:text-xl">"{data.dailyTheme.title}"</p>
          <Button asChild={true} className="m-1">
            <Link to={`/tags/${data.dailyTheme.title}`}>
              タグの作品一覧を見る
            </Link>
          </Button>
          <p>
            <Link to={`/themes/${year}/${month}/`} className="underline">
              {year}年 {month}月
            </Link>
            {day}日
          </p>
          <p>
            昨日：
            <Button asChild={true} className="m-1">
              <Link
                to={`/themes/${yesterday.getFullYear()}/${
                  yesterday.getMonth() + 1
                }/${yesterday.getDate()}`}
              >
                {yesterday.getFullYear()}年 {yesterday.getMonth() + 1}月{" "}
                {yesterday.getDate()}日
              </Link>
            </Button>
            <br />
            明日：
            <Button asChild={true} className="m-1">
              <Link
                to={`/themes/${tomorrow.getFullYear()}/${
                  tomorrow.getMonth() + 1
                }/${tomorrow.getDate()}`}
              >
                {tomorrow.getFullYear()}年 {tomorrow.getMonth() + 1}月{" "}
                {tomorrow.getDate()}日
              </Link>
            </Button>
          </p>
        </div>
      </article>
    </AppPage>
  )
}
