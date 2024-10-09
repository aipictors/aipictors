import { ConstructionAlert } from "~/components/construction-alert"
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
import { UserProfileFragment } from "~/routes/($lang)._main.users.$user._index/components/user-content-body"
import { UserSensitivePage } from "~/routes/($lang).r.users.$user._index/components/user-sensitive-page"

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
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    novelWhere: {
      userId: userIdResp.data.user.id,
      workType: "NOVEL",
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    columnWhere: {
      userId: userIdResp.data.user.id,
      workType: "COLUMN",
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    videoWhere: {
      userId: userIdResp.data.user.id,
      workType: "VIDEO",
      ratings: ["R18", "R18G"],
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
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      novelWhere: {
        userId: userIdResp.data.user.id,
        workType: "NOVEL",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      columnWhere: {
        userId: userIdResp.data.user.id,
        workType: "COLUMN",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      videoWhere: {
        userId: userIdResp.data.user.id,
        workType: "VIDEO",
        ratings: ["R18", "R18G"],
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
    return [{ title: "ユーザのセンシティブマイページ" }]
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
      enTitle: `${user.user.name}'s sensitive page${worksCountPart}`,
      description:
        user.user.biography ||
        "Aipictorsのセンシティブマイページです、AIイラストなどの作品一覧を閲覧することができます",
      enDescription: `This is ${user.user.name}'s sensitive page on Aipictors, where you can view a list of AI illustrations and other works`,
      url: user.user.headerImageUrl?.length
        ? user.user.headerImageUrl
        : user.user.iconUrl
          ? ExchangeIconUrl(user.user.iconUrl)
          : "",
    },
    props.params.lang,
  )
}

export default function UserSensitiveLayout() {
  const params = useParams<"user">()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  return (
    <>
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL={`https://www.aipictors.com/users/${params.user}`}
        deadline={"2024-07-30"}
      />
      <UserSensitivePage
        user={data.user}
        works={data.works}
        novelWorks={data.novelWorks}
        columnWorks={data.columnWorks}
        videoWorks={data.videoWorks}
        worksCount={data.worksCount}
      />
    </>
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
