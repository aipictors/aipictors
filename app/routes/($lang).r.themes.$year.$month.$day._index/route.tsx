import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { getJstDate } from "~/utils/jst-date"
import { SensitiveThemeContainer } from "~/routes/($lang)._main.themes._index/components/sensitive-theme-container"

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response("Invalid date", { status: 400 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const tab = url.searchParams.get("tab")

  const dailyThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year, month },
    },
  })

  const [dailyTheme = null] = dailyThemesResp.data.dailyThemes

  if (dailyTheme === null) {
    throw new Response("Not found", { status: 404 })
  }

  const targetThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 1,
      where: { year, month, day },
    },
  })

  const monthlyThemes = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 31,
      where: { year, month },
    },
  })

  const worksResp = await loaderClient.query({
    query: themeWorksAndCountQuery,
    variables: {
      offset: page * 64,
      limit: 64,
      where: {
        subjectId: Number(targetThemesResp.data.dailyThemes[0].id),
        ratings: ["R18", "R18G"],
        orderBy: "DATE_CREATED",
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

  const today = getJstDate(new Date())

  const todayYear = today.getFullYear()

  const todayMonth = today.getMonth() + 1

  const todayDay = today.getDate()

  const jstStartDate = getJstDate(new Date(today.setDate(today.getDate() + 1)))

  const jstEndDate = getJstDate(new Date(today.setDate(today.getDate() + 7)))

  const startDate = jstStartDate.toISOString().split("T")[0]

  const endDate = jstEndDate.toISOString().split("T")[0]

  const afterSevenDayThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 7,
      where: { startDate, endDate },
    },
  })

  const dailyBeforeThemes = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 14,
      where: {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(sevenDaysAfter),
        orderBy: "DATE_STARTED",
        sort: "ASC",
      },
    },
  })

  const todayThemesResp = await loaderClient.query({
    query: dailyThemesQuery,
    variables: {
      offset: 0,
      limit: 32,
      where: { year: todayYear, month: todayMonth, day: todayDay },
    },
  })

  return {
    dailyTheme,
    worksResp,
    year,
    month,
    day,
    page,
    monthlyThemes,
    dailyBeforeThemes,
    afterSevenDayThemes: afterSevenDayThemesResp.data.dailyThemes,
    dailyThemes: dailyThemesResp.data.dailyThemes,
    todayTheme: todayThemesResp.data.dailyThemes.length
      ? todayThemesResp.data.dailyThemes[0]
      : null,
    targetThemesResp: targetThemesResp.data.dailyThemes,
    tab,
    themeId: Number(targetThemesResp.data.dailyThemes[0].id),
  }
}

export default function SensitiveDayThemePage() {
  const data = useLoaderData<typeof loader>()

  console.log(data.tab !== "list" ? "calender" : "list")

  return (
    <article>
      <SensitiveThemeContainer
        dailyThemes={data.dailyThemes}
        targetThemes={data.targetThemesResp}
        todayTheme={data.todayTheme}
        works={data.worksResp.data.works}
        afterSevenDayThemes={data.afterSevenDayThemes}
        dailyBeforeThemes={data.dailyBeforeThemes.data.dailyThemes}
        worksCount={data.worksResp.data.worksCount}
        page={data.page}
        year={data.year}
        day={data.day}
        month={data.month}
        defaultTab={data.tab !== "list" ? "calender" : "list"}
        themeId={data.themeId}
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
      proposer {
        id
        name
        iconUrl
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
