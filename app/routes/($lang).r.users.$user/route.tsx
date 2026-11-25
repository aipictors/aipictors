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
  UserTabs,
  UserTabsFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
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
    // hasSensitiveImageWorks などが作品があっても false のことがあるので、件数でもタブを出す（全年齢のページと同じ）
    worksCounts: {
      image: r18WorksCountResult.data.imageWorksCount,
      novel: r18WorksCountResult.data.novelWorksCount,
      video: r18WorksCountResult.data.videoWorksCount,
      column: r18WorksCountResult.data.columnWorksCount,
    },
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
  const login = user.login
  const r18WorksCount = props.data.r18WorksCount
  const countText = r18WorksCount.toLocaleString()

  const iconUrl = user.iconUrl !== null ? withIconUrlFallback(user.iconUrl) : ""

  return createSensitiveMeta(
    // R18 の作品がないページは全年齢のページと中身が変わらないので検索エンジンに載せない
    { ...META.USERS, isIndex: r18WorksCount > 0 },
    {
      title:
        r18WorksCount > 0
          ? `${user.name}（@${login}）のR18 AIイラスト・作品一覧（${countText}作品）`
          : `${user.name}（@${login}）のR18作品`,
      enTitle:
        r18WorksCount > 0
          ? `${user.name} (@${login}) - R18 AI illustrations (${countText} works)`
          : `${user.name} (@${login}) - R18 works`,
      description: `${user.name}（@${login}）さんがAipictorsに投稿した18歳以上の方向けのAIイラスト・AI画像の一覧です（${countText}作品）。人気の作品やプロンプトを見られます。`,
      enDescription: `${countText} adult AI illustrations and images posted by ${user.name} (@${login}) on Aipictors, for people aged 18 and over.`,
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
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 md:px-8">
        {/* 全年齢のページと同じ丸いタブ。行き先と作品の有無は R18 */}
        <UserTabs
          user={user}
          worksCounts={data.worksCounts}
          albumsCount={data.sensitiveAlbumsCount}
          isSensitive
        />
        <Outlet />
      </div>
    </div>
  )
}

const MetaUserFragment = graphql(
  `fragment MetaUserFragment on UserNode {
    worksCount
    login
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
      ...UserTabsFragment
      ...MetaUserFragment
    }
  }`,
  [
    MetaUserFragment,
    UserHomeHeaderFragment,
    UserProfileIconFragment,
    UserTabsFragment,
  ],
)

const UserR18WorksCountQuery = graphql(
  `query UserR18WorksCount($userId: ID!) {
    r18WorksCount: worksCount(where: { userId: $userId, ratings: [R18, R18G], isSensitive: true })
    imageWorksCount: worksCount(where: { userId: $userId, workType: WORK, ratings: [R18, R18G], isNowCreatedAt: true })
    novelWorksCount: worksCount(where: { userId: $userId, workType: NOVEL, ratings: [R18, R18G], isNowCreatedAt: true })
    videoWorksCount: worksCount(where: { userId: $userId, workType: VIDEO, ratings: [R18, R18G], isNowCreatedAt: true })
    columnWorksCount: worksCount(where: { userId: $userId, workType: COLUMN, ratings: [R18, R18G], isNowCreatedAt: true })
    sensitiveAlbumsCount: albumsCount(where: { ownerUserId: $userId, ratings: [R18, R18G], isSensitive: true, needInspected: false, hasWorks: true })
  }`,
)
