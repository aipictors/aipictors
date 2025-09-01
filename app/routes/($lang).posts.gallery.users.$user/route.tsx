import { useLoaderData, useParams } from "@remix-run/react"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { loaderClient } from "~/lib/loader-client"
import { ParamsError } from "~/errors/params-error"
import type { HeadersFunction } from "@remix-run/cloudflare"
import { config } from "~/config"
import { GalleryHeader } from "~/components/gallery-header"
import { GallerySearchFilters } from "~/components/gallery-search-filters"
import { UserGalleryView } from "~/routes/($lang).posts.gallery.users.$user/components/user-gallery-view"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
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

  return json({
    userId: userIdResp.data.user.id,
    userLogin: userIdResp.data.user.login,
    userName: userIdResp.data.user.name,
  })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * ギャラリー内のユーザー専用ページ
 */
export default function GalleryUserPage() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ギャラリーヘッダー */}
      <GalleryHeader />

      {/* 詳細検索フィルター */}
      <GallerySearchFilters />

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ユーザー情報ヘッダー */}
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-foreground">
            {data.userName}のギャラリー
          </h1>
          <p className="text-muted-foreground">@{data.userLogin}</p>
        </div>

        {/* ユーザー作品ギャラリー */}
        <UserGalleryView userId={data.userId} />
      </div>
    </div>
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
      login
      name
    }
  }`,
)
