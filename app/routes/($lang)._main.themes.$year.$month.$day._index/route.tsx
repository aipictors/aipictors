import { Button } from "@/_components/ui/button"
import { AppPage } from "@/_components/app/app-page"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

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

  const calculateDate = (
    year: number,
    month: number,
    day: number,
    offset: number,
  ) => {
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + offset)
    return date
  }

  const yesterday = calculateDate(year, month, day, -1)
  const tomorrow = calculateDate(year, month, day, 1)

  const dateLink = (date: Date) => {
    return (
      <Link
        to={`/themes/${date.getFullYear()}/${
          date.getMonth() + 1
        }/${date.getDate()}`}
      >
        {date.getFullYear()}年 {date.getMonth() + 1}月 {date.getDate()}日
      </Link>
    )
  }

  const yesterdayLink = dateLink(yesterday)
  const tomorrowLink = dateLink(tomorrow)

  return (
    <AppPage>
      <article>
        <h1>お題</h1>
        <div className="m-4">
          <p className="text-lg md:text-xl">"{data.dailyTheme.title}"</p>
          <Button asChild={true} className="m-1">
            <Link
              to={`https://www.aipictors.com/search/?tag=${data.dailyTheme.title}`}
            >
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
              {yesterdayLink}
            </Button>
            <br />
            明日：
            <Button asChild={true} className="m-1">
              {tomorrowLink}
            </Button>
          </p>
        </div>
      </article>
    </AppPage>
  )
}

export const dailyThemesQuery = graphql(
  `query DailyThemes(
    $offset: Int!
    $limit: Int!
    $where: DailyThemesWhereInput!
  ) {
    dailyThemes(offset: $offset, limit: $limit, where: $where) {
      id
      title
      dateText
      year
      month
      day
      worksCount
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
