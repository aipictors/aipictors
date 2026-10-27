import { useQuery } from "@apollo/client/index"
import type { HeadersFunction } from "@remix-run/cloudflare"
import {
  type MetaFunction,
  Outlet,
  useLoaderData,
  useParams,
} from "@remix-run/react"
import { graphql, type ResultOf, readFragment } from "gql.tada"
import { useContext } from "react"
import type { LoaderFunctionArgs } from "react-router-dom"
import type { ProfilePage, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { fetchPublicUserModels } from "~/lib/server/user-models.server"
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
import { createMeta } from "~/utils/create-meta"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

const SITE_URL = "https://www.aipictors.com"

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

  // R18 作品数と公開モデル数は同時に取る（以前は 1 つずつ待っていた）
  const [r18WorksCountResult, userModels] = await Promise.all([
    loaderClient.query({
      query: UserR18WorksCountQuery,
      variables: { userId: result.data.user.id },
    }),
    fetchPublicUserModels(
      props.context as Parameters<typeof fetchPublicUserModels>[0],
      { userId: result.data.user.id, sort: "new", limit: 60 },
    ),
  ])

  return {
    user: result.data.user,
    r18WorksCount: r18WorksCountResult.data.r18WorksCount,
    // hasImageWorks などが作品があっても false のことがあるので、件数でもタブを出す
    worksCounts: {
      image: r18WorksCountResult.data.imageWorksCount,
      novel: r18WorksCountResult.data.novelWorksCount,
      video: r18WorksCountResult.data.videoWorksCount,
      column: r18WorksCountResult.data.columnWorksCount,
    },
    modelsCount: userModels.models.length,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

/**
 * 自己紹介を説明文用に 1 行・120 文字までにする
 */
const toDescription = (text: string) => {
  const oneLine = text.replace(/\s+/g, " ").trim()
  return oneLine.length > 120 ? `${oneLine.slice(0, 119)}…` : oneLine
}

export const meta: MetaFunction<typeof loader> = (props) => {
  if (props.data === undefined) {
    throw new Error("Data is undefined")
  }

  const user = readFragment(MetaUserFragment, props.data.user)
  const name = user.name.length > 0 ? user.name : user.login
  const worksCount = user.worksCount.toLocaleString()

  const iconUrl = user.iconUrl !== null ? withIconUrlFallback(user.iconUrl) : ""
  const biography = toDescription(user.biography ?? "")
  const enBiography = toDescription(user.enBiography || user.biography || "")

  return createMeta(
    META.USERS,
    {
      title:
        user.worksCount > 0
          ? `${name}（@${user.login}）のAIイラスト・作品一覧（${worksCount}作品）`
          : `${name}（@${user.login}）のプロフィール`,
      enTitle:
        user.worksCount > 0
          ? `${name} (@${user.login}) - AI illustrations (${worksCount} works)`
          : `${name} (@${user.login})`,
      description:
        biography.length > 0
          ? `${biography} ｜ ${name}さんがAipictorsに投稿したAIイラスト・AI画像${worksCount}作品を見られます。`
          : `${name}（@${user.login}）さんがAipictorsに投稿したAIイラスト・AI画像の作品一覧です。${worksCount}作品・フォロワー${user.followersCount.toLocaleString()}人。人気の作品やプロンプト、シリーズ、モデルを見られます。`,
      enDescription:
        enBiography.length > 0
          ? `${enBiography} | ${worksCount} AI illustrations by ${name} on Aipictors.`
          : `AI illustrations and AI images posted by ${name} (@${user.login}) on Aipictors. ${worksCount} works, ${user.followersCount.toLocaleString()} followers.`,
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

  // フォロー中かどうかなど、見ている人によって変わる情報はログイン中だけ取り直す
  const { data: userRet } = useQuery(UserQuery, {
    errorPolicy: "all",
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(params.user),
    },
  })

  const user = userRet?.user ?? data.user
  const metaUser = readFragment(MetaUserFragment, data.user)

  return (
    <div className="flex w-full flex-col justify-center">
      <AppJsonLdScript jsonLd={toProfileJsonLd(metaUser)} />
      <UserHomeHeader
        user={user}
        userIconView={
          <UserProfileNameIcon user={user} r18WorksCount={data.r18WorksCount} />
        }
      />
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 md:px-8">
        <UserTabs
          user={user}
          modelsCount={data.modelsCount}
          worksCounts={data.worksCounts}
        />
        <Outlet />
      </div>
    </div>
  )
}

/**
 * 検索エンジン向けのプロフィール（schema.org ProfilePage）
 */
const toProfileJsonLd = (
  user: ResultOf<typeof MetaUserFragment>,
): WithContext<ProfilePage> => {
  const url = `${SITE_URL}/users/${encodeURIComponent(user.login)}`
  const sameAs = [
    user.twitterAccountId ? `https://x.com/${user.twitterAccountId}` : null,
    user.instagramAccountId
      ? `https://www.instagram.com/${user.instagramAccountId}`
      : null,
    user.githubAccountId ? `https://github.com/${user.githubAccountId}` : null,
  ].filter((value): value is string => value !== null)

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${user.name || user.login}（@${user.login}）`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "Person",
      "@id": `${url}#person`,
      name: user.name || user.login,
      alternateName: `@${user.login}`,
      identifier: user.id,
      url,
      ...(user.iconUrl ? { image: withIconUrlFallback(user.iconUrl) } : {}),
      ...(user.biography ? { description: user.biography.slice(0, 500) } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: { "@type": "FollowAction" },
          userInteractionCount: user.followersCount,
        },
        {
          "@type": "InteractionCounter",
          interactionType: { "@type": "WriteAction" },
          userInteractionCount: user.worksCount,
        },
      ],
    },
  }
}

const MetaUserFragment = graphql(
  `fragment MetaUserFragment on UserNode {
    id
    login
    worksCount
    followersCount
    name
    biography
    enBiography
    headerImageUrl
    iconUrl
    twitterAccountId
    instagramAccountId
    githubAccountId
  }`,
)

const UserQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      id
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
    imageWorksCount: worksCount(where: { userId: $userId, workType: WORK, ratings: [G, R15] })
    novelWorksCount: worksCount(where: { userId: $userId, workType: NOVEL, ratings: [G, R15] })
    videoWorksCount: worksCount(where: { userId: $userId, workType: VIDEO, ratings: [G, R15] })
    columnWorksCount: worksCount(where: { userId: $userId, workType: COLUMN, ratings: [G, R15] })
  }`,
)
