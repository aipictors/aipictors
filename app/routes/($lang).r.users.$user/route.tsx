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
  UserProfileIconFragment,
  UserProfileNameIcon,
} from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import {
  UserSensitiveTabs,
  UserSensitiveTabsFragment,
} from "~/routes/($lang).r.users.$user/components/user-sensitive-tabs"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import { toHasSensitiveProfile } from "~/utils/has-sensitive-profile"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const result = await loaderClient.query({
    query: UserQuery,
    errorPolicy: "all",
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (result.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const r18WorksCountResult = await loaderClient.query({
    query: UserR18WorksCountQuery,
    variables: {
      userId: result.data.user.id,
    },
  })

  return {
    user: result.data.user,
    r18WorksCount: r18WorksCountResult.data.r18WorksCount,
    // hasAlbums は全年齢のシリーズも数えるので、R18 のシリーズの数でタブを出す
    sensitiveAlbumsCount: r18WorksCountResult.data.sensitiveAlbumsCount,
  }
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

  return createSensitiveMeta(
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
    errorPolicy: "all",
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(params.user),
    },
  })

  // フォロワーなどの最新情報をログインしている場合は取得する
  const user = userRet?.user ?? data.user
  const r18WorksCount = data.r18WorksCount
  // R18 用に登録したヘッダー・紹介・リンク（未登録の項目はいつものプロフィール）
  const sensitiveProfile = user.sensitiveProfile ?? null

  return (
    <div className="flex w-full flex-col justify-center">
      <div className="relative">
        <UserHomeHeader
          user={user}
          headerImageUrl={sensitiveProfile?.headerImageUrl}
          userIconView={
            <UserProfileNameIcon
              user={user}
              mode="r18"
              r18WorksCount={r18WorksCount}
              sensitiveProfile={sensitiveProfile}
              hasSensitiveProfile={toHasSensitiveProfile(sensitiveProfile)}
            />
          }
        />
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 md:px-8">
        <UserSensitiveTabs
          user={user}
          albumsCount={data.sensitiveAlbumsCount}
        />
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
      id
      sensitiveProfile {
        headerImageUrl
        biography
        enBiography
        links
      }
      ...UserHomeHeaderFragment
      ...UserProfileIconFragment
      ...UserSensitiveTabsFragment
      ...MetaUserFragment
    }
  }`,
  [
    MetaUserFragment,
    UserHomeHeaderFragment,
    UserProfileIconFragment,
    UserSensitiveTabsFragment,
  ],
)

const UserR18WorksCountQuery = graphql(
  `query UserR18WorksCount($userId: ID!) {
    r18WorksCount: worksCount(where: { userId: $userId, ratings: [R18, R18G], isSensitive: true })
    sensitiveAlbumsCount: albumsCount(where: { ownerUserId: $userId, ratings: [R18, R18G], isSensitive: true, needInspected: false })
  }`,
)
