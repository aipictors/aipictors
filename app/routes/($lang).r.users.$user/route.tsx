import {
  json,
  type MetaFunction,
  Outlet,
  useLoaderData,
  useParams,
} from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import type { LoaderFunctionArgs } from "react-router-dom"
import { META } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  UserHomeHeader,
  UserHomeHeaderFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-home-header"
import {
  UserHomeMenu,
  userHomeMenuFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-home-menu"
import {
  UserProfileIconFragment,
  UserProfileNameIcon,
} from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import {
  UserSensitiveTabs,
  UserSensitiveTabsFragment,
} from "~/routes/($lang).r.users.$user/components/user-sensitive-tabs"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

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

  const userResp = await loaderClient.query({
    query: userQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: userResp.data.user,
    worksCount: userResp.data.user.worksCount,
  })
}

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    return [{ title: "ユーザのマイページ" }]
  }

  const user = props.data as {
    user: FragmentOf<typeof UserMetaFragment>
  }

  const worksCountPart =
    user.user.worksCount > 0 ? ` (${user.user.worksCount}作品)` : ""

  return createMeta(
    META.USERS,
    {
      title:
        `${user.user.name}のセンシティブマイページ${worksCountPart}` ||
        "ユーザーのセンシティブマイページ",
      enTitle: `${user.user.name}'s page${worksCountPart}`,
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
      <div className="relative">
        <UserHomeHeader
          user={data.user}
          userIconView={<UserProfileNameIcon user={data.user} />}
        />
        <UserHomeMenu user={data.user} />
      </div>
      <div className="flex flex-col space-y-4">
        <UserSensitiveTabs user={data.user} />
        <Outlet />
      </div>
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

const UserMetaFragment = graphql(
  `fragment UserMeta on UserNode @_unmask {
    worksCount
    name
    biography
    headerImageUrl
    iconUrl
  }`,
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserProfileIcon
      ...UserHomeMenu
      ...UserHomeHeader
      ...UserTabs
      ...UserMeta
    }
  }`,
  [
    UserProfileIconFragment,
    userHomeMenuFragment,
    UserHomeHeaderFragment,
    UserSensitiveTabsFragment,
    UserMetaFragment,
  ],
)
