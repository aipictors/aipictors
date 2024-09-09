import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ThemeArticleContainer } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article-container"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { redirectUrlWithOptionalSensitiveParam } from "~/utils/redirect-url-with-optional-sensitive-param"

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response("Invalid date", { status: 400 })
  }

  const redirectResult = redirectUrlWithOptionalSensitiveParam(
    props.request,
    `/sensitive/themes/${props.params.year}/${props.params.month}/${props.params.day}`,
  )
  if (redirectResult) {
    return redirectResult
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

  const monthlyThemes = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year, month },
    },
  })

  const worksResp = await client.query({
    query: themeWorksAndCountQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        subjectId: Number(dailyThemesResp.data.dailyThemes[0].id),
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 7日前後の日付から7日前のお題を取得する
  const sevenDaysAgo = new Date(Number(year), Number(month) - 1, Number(day))

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const sevenDaysAfter = new Date(Number(year), Number(month) - 1, Number(day))

  sevenDaysAfter.setDate(sevenDaysAgo.getDate() + 14)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  console.log(formatDate(sevenDaysAgo))
  console.log(formatDate(sevenDaysAfter))

  const dailyBeforeThemes = await client.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 14,
      where: {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(sevenDaysAfter),
      },
    },
  })

  return json({
    dailyTheme,
    worksResp,
    year,
    month,
    day,
    page,
    monthlyThemes,
    dailyBeforeThemes,
  })
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
        isSensitive={false}
        themeId={data.dailyTheme.id}
        dailyThemes={data.monthlyThemes.data.dailyThemes}
        dailyBeforeThemes={data.dailyBeforeThemes.data.dailyThemes}
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
        ...PhotoAlbumWork
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const themeWorksAndCountQuery = graphql(
  `query AlbumWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ThemeWork
    }
    worksCount(where: $where)
  }`,
  [ThemeWorkFragment],
)
