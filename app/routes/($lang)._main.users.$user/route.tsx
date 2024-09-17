import { ConstructionAlert } from "~/components/construction-alert"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { UserProfileFragment } from "~/routes/($lang)._main.users.$user/components/user-contents"
import { userHomeMainFragment } from "~/routes/($lang)._main.users.$user/components/user-home-main"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user/components/user-profile-name-icon"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { UserPage } from "~/routes/($lang)._main.users.$user/components/user-page"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  // const urlParams = new URLSearchParams(props.request.url.split("?")[1])
  // const pageParam = urlParams.get("page")
  // const page = pageParam ? Number(pageParam) : 0

  const userResp = await loaderClient.query({
    query: userQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const workRes = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: userResp.data.user.id,
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const worksCount = await loaderClient.query({
    query: worksCountQuery,
    variables: {
      where: {
        userId: userResp.data.user.id,
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  const novelWorkRes = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: userResp.data.user.id,
        workType: "NOVEL",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const novelWorksCount = await loaderClient.query({
    query: worksCountQuery,
    variables: {
      where: {
        workType: "NOVEL",
        userId: userResp.data.user.id,
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  const columnWorkRes = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: userResp.data.user.id,
        workType: "COLUMN",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const columnWorksCount = await loaderClient.query({
    query: worksCountQuery,
    variables: {
      where: {
        workType: "COLUMN",
        userId: userResp.data.user.id,
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  const videoWorkRes = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: userResp.data.user.id,
        workType: "VIDEO",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const videoWorksCount = await loaderClient.query({
    query: worksCountQuery,
    variables: {
      where: {
        workType: "VIDEO",
        userId: userResp.data.user.id,
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
    },
  })

  return json({
    user: userResp.data.user,
    works: workRes.data.works,
    worksCount: worksCount.data.worksCount,
    novelWorks: novelWorkRes.data.works,
    novelWorksCount: novelWorksCount.data.worksCount,
    columnWorks: columnWorkRes.data.works,
    columnWorksCount: columnWorksCount.data.worksCount,
    videoWorks: videoWorkRes.data.works,
    videoWorksCount: videoWorksCount.data.worksCount,
  })
}

export const meta: MetaFunction = ({ data }) => {
  // data.user が存在しないか、オブジェクトでない場合のチェック
  if (!data) {
    return [{ title: "ユーザのマイページ" }]
  }

  const user = data as { user: FragmentOf<typeof UserProfileIconFragment> }

  const worksCountPart =
    user.user.worksCount > 0 ? ` (${user.user.worksCount}作品)` : ""

  return createMeta(META.USERS, {
    title:
      `${user.user.name}のマイページ${worksCountPart}` ||
      "ユーザーのマイページ",
    description:
      user.user.biography ||
      "Aipictorsのマイページです、AIイラストなどの作品一覧を閲覧することができます",
    url: user.user.headerImageUrl?.length
      ? user.user.headerImageUrl
      : user.user.iconUrl
        ? ExchangeIconUrl(user.user.iconUrl)
        : "",
  })
}

export default function UserLayout() {
  const params = useParams<"user">()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL={`https://www.aipictors.com/users/${params.user}`}
        deadline={"2024-07-30"}
      />
      <UserPage
        user={data.user}
        works={data.works}
        novelWorks={data.novelWorks}
        columnWorks={data.columnWorks}
        videoWorks={data.videoWorks}
        worksCount={data.worksCount}
        novelWorksCount={data.novelWorksCount}
        columnWorksCount={data.columnWorksCount}
        videoWorksCount={data.videoWorksCount}
      />
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserHomeMain
      ...UserProfile
      ...UserProfileIcon
    }
  }`,
  [userHomeMainFragment, UserProfileFragment, UserProfileIconFragment],
)

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork,
      ...HomeNovelsWorkListItem
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
