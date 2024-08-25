import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ThemeArticleContainer } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article-container"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"

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

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

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

  const worksResp = await client.query({
    query: themeWorksAndCountQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        subjectId: Number(dailyThemesResp.data.dailyThemes[0].id),
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isSensitive: true,
        isNowCreatedAt: true,
      },
    },
  })

  return json(
    { dailyTheme, worksResp, year, month, day, page },
    // {
    //   headers: {
    //     "Cache-Control": config.cacheControl.oneDay,
    //   },
    // },
  )
}

export default function SensitiveDayThemePage() {
  const data = useLoaderData<typeof loader>()

  return (
    <article>
      <ThemeArticleContainer
        works={data.worksResp.data.works}
        worksCount={data.worksResp.data.worksCount}
        firstWork={data.dailyTheme.firstWork}
        title={`${data.year}/${data.month}/${data.day}のお題「${data.dailyTheme.title}」`}
        year={data.year}
        month={data.month}
        day={data.day}
        page={data.page}
        isSensitive={true}
        themeId={data.dailyTheme.id}
      />
    </article>
  )
}

const dailyThemesQuery = graphql(
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
        ...ThemeWork
      }
    }
  }`,
  [ThemeWorkFragment],
)

export const themeWorksAndCountQuery = graphql(
  `query AlbumWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ThemeWork
    }
    worksCount(where: $where)
  }`,
  [ThemeWorkFragment],
)
