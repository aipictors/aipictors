import { useQuery } from "@apollo/client/index"
import type { HeadersFunction } from "@remix-run/cloudflare"
import {
  type MetaFunction,
  Outlet,
  useLoaderData,
  useParams,
} from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { useContext } from "react"
import type { LoaderFunctionArgs } from "react-router-dom"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  UserHomeHeader,
  UserHomeHeaderFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-home-header"
import {
  UserHomeMenuSensitiveFragment,
  UserHomeSensitiveMenu,
} from "~/routes/($lang)._main.users.$user._index/components/user-home-sensitive-menu"
import {
  UserProfileIconFragment,
  UserProfileNameIcon,
} from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import {
  UserSensitiveTabs,
  UserSensitiveTabsFragment,
} from "~/routes/($lang).r.users.$user/components/user-sensitive-tabs"
import { createMeta } from "~/utils/create-meta"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const result = await loaderClient.query({
    query: UserQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (result.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return { user: result.data.user }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "ユーザのマイページ" }]
  }

  const user = readFragment(MetaUserFragment, props.data.user)

  const worksCountText = user.worksCount > 0 ? ` (${user.worksCount}作品)` : ""

  const iconUrl = user.iconUrl !== null ? withIconUrlFallback(user.iconUrl) : ""

  return createMeta(
    META.USERS,
    {
      title: `${user.name}のセンシティブマイページ${worksCountText}`,
      enTitle: `${user.name}'s page${worksCountText}`,
      description:
        user.biography ||
        "Aipictorsのセンシティブマイページです、AIイラストなどの作品一覧を閲覧することができます",
      enDescription: `This is ${user.name}'s sensitive page on Aipictors, where you can view a list of AI illustrations and other works`,
      url: user.headerImageUrl ?? iconUrl,
    },
    props.params.lang,
  )
}

export default function UserLayout() {
  const params = useParams<"user">()

  const authContext = useContext(AuthContext)

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const { data: userRet } = useQuery(UserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(params.user),
    },
  })

  // フォロワーなどの最新情報をログインしている場合は取得する
  const user = userRet?.user ?? data.user

  return (
    <div className="flex w-full flex-col justify-center">
      <div className="relative">
        <UserHomeHeader
          user={user}
          userIconView={<UserProfileNameIcon user={user} />}
        />
        <UserHomeSensitiveMenu user={user} />
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 md:px-8">
        <UserSensitiveTabs user={user} />
        <Outlet />
      </div>
    </div>
  )
}

const MetaUserFragment = graphql(
  `fragment MetaUserFragment on UserNode {
    worksCount
    name
    biography
    headerImageUrl
    iconUrl
  }`,
)

const UserQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      ...UserHomeHeaderFragment
      ...UserProfileIconFragment
      ...UserHomeMenuSensitiveFragment
      ...UserSensitiveTabsFragment
      ...MetaUserFragment
    }
  }`,
  [
    MetaUserFragment,
    UserHomeHeaderFragment,
    UserHomeMenuSensitiveFragment,
    UserProfileIconFragment,
    UserSensitiveTabsFragment,
  ],
)
