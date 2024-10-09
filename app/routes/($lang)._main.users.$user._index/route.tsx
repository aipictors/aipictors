import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { userHomeMainFragment } from "~/routes/($lang)._main.users.$user._index/components/user-home-main"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { UserWorkFragment } from "~/routes/($lang)._main.users.$user._index/components/user-page"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import {
  UserContentBody,
  UserProfileFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-content-body"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  console.log({
    userId: decodeURIComponent(props.params.user),
    offset: 0,
    limit: 16,
    portfolioWhere: {
      userId: userIdResp.data.user.id,
      ratings: ["G", "R15"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    novelWhere: {
      userId: userIdResp.data.user.id,
      workType: "NOVEL",
      ratings: ["G", "R15"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    columnWhere: {
      userId: userIdResp.data.user.id,
      workType: "COLUMN",
      ratings: ["G", "R15"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    videoWhere: {
      userId: userIdResp.data.user.id,
      workType: "VIDEO",
      ratings: ["G", "R15"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
  })

  const userResp = await loaderClient.query({
    query: combinedUserAndWorksQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
      offset: 0,
      limit: 16,
      portfolioWhere: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      novelWhere: {
        userId: userIdResp.data.user.id,
        workType: "NOVEL",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      columnWhere: {
        userId: userIdResp.data.user.id,
        workType: "COLUMN",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      videoWhere: {
        userId: userIdResp.data.user.id,
        workType: "VIDEO",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  console.log(userResp)

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: userResp.data.user,
    works: userResp.data.works,
    worksCount: userResp.data.user.worksCount,
    novelWorks: userResp.data.novelWorks,
    columnWorks: userResp.data.columnWorks,
    videoWorks: userResp.data.videoWorks,
  })
}

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    return [{ title: "ユーザのマイページ" }]
  }

  const user = props.data as {
    user: FragmentOf<typeof UserProfileIconFragment>
  }

  const worksCountPart =
    user.user.worksCount > 0 ? ` (${user.user.worksCount}作品)` : ""

  return createMeta(
    META.USERS,
    {
      title:
        `${user.user.name}のマイページ${worksCountPart}` ||
        "ユーザーのマイページ",
      enTitle: `${user.user.name}'s page${worksCountPart}`,
      description:
        user.user.biography ||
        "Aipictorsのマイページです、AIイラストなどの作品一覧を閲覧することができます",
      enDescription: `This is ${user.user.name}'s page on Aipictors, where you can view a list of AI illustrations and other works`,
      url: user.user.headerImageUrl?.length
        ? user.user.headerImageUrl
        : user.user.iconUrl
          ? ExchangeIconUrl(user.user.iconUrl)
          : "",
    },
    props.params.lang,
  )
}

export default function UserLayout() {
  const params = useParams<"user">()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={data.user} />
      <UserContentBody
        user={data.user}
        works={data.works}
        novelWorks={data.novelWorks}
        columnWorks={data.columnWorks}
        videoWorks={data.videoWorks}
        worksCount={data.worksCount}
      />
    </div>
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)

const combinedUserAndWorksQuery = graphql(
  `query CombinedUserAndWorks(
    $userId: ID!,
    $offset: Int!,
    $limit: Int!,
    $portfolioWhere: WorksWhereInput!,
    $novelWhere: WorksWhereInput!,
    $columnWhere: WorksWhereInput!,
    $videoWhere: WorksWhereInput!
  ) {
    user(id: $userId) {
      ...UserHomeMain
      ...UserProfile
      ...UserProfileIcon
    }
    works(offset: $offset, limit: $limit, where: $portfolioWhere) {
      ...UserWork
    }
    novelWorks: works(offset: $offset, limit: $limit, where: $novelWhere) {
      ...UserWork
    }
    columnWorks: works(offset: $offset, limit: $limit, where: $columnWhere) {
      ...UserWork
    }
    videoWorks: works(offset: $offset, limit: $limit, where: $videoWhere) {
      ...UserWork
    }
  }`,
  [
    userHomeMainFragment,
    UserProfileFragment,
    UserProfileIconFragment,
    UserWorkFragment,
  ],
)
