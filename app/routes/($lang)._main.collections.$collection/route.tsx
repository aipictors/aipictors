import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
import {
  COLLECTION_WORKS_PER_PAGE,
  isAdultCollection,
  toCollectionCoverUrl,
  toCollectionMetaText,
  toCollectionPageIndex,
} from "~/routes/($lang)._main.collections.$collection/collection-page-utils"
import {
  CollectionHeader,
  CollectionHeaderFragment,
} from "~/routes/($lang)._main.collections.$collection/components/collection-header"
import {
  CollectionWorkList,
  CollectionWorkListItemFragment,
} from "~/routes/($lang)._main.collections.$collection/components/collection-works-list"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.collection === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const page = toCollectionPageIndex(url.searchParams.get("page"))

  const collectionResp = await loaderClient.query({
    query: folderQuery,
    variables: {
      nanoid: props.params.collection,
      offset: page * COLLECTION_WORKS_PER_PAGE,
      limit: COLLECTION_WORKS_PER_PAGE,
    },
  })

  return {
    nanoid: props.params.collection,
    folder: collectionResp.data.folder,
    page: page,
  }
}

export const meta: MetaFunction<typeof loader> = (props) => {
  const folder = props.data?.folder

  // 非公開のコレクションはサーバーで取れない（作成者のブラウザでだけ表示する）
  if (!folder) {
    return createMeta(
      { ...META.ALBUMS, isIndex: false },
      {
        title: "コレクション",
        enTitle: "Collection",
        description: "",
        enDescription: "",
        url: config.defaultOgpImageUrl,
      },
      props.params.lang,
    )
  }

  const metaTags = createMeta(
    {
      ...META.ALBUMS,
      // 作品のないもの・題名のない自動作成のものは検索結果に出さない
      isIndex: (folder.worksCount ?? 0) > 0 && folder.title.trim().length > 0,
    },
    {
      ...toCollectionMetaText(folder, props.data?.page ?? 0),
      url: toCollectionCoverUrl(folder) ?? config.defaultOgpImageUrl,
    },
    props.params.lang,
  )

  return isAdultCollection(folder)
    ? [...metaTags, { name: "rating", content: "adult" }]
    : metaTags
}

export const headers: HeadersFunction = () => ({
  // 作品の一覧をサーバーの HTML に入れるので、追加した作品がすぐ出るよう短めにする
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * コレクションの詳細
 */
export default function Collection() {
  const data = useLoaderData<typeof loader>()

  const authContext = useContext(AuthContext)

  // サーバーの HTML は未ログインの内容なので、ログイン中は読み直す
  // （非公開のコレクションは作成者にしか返らず、フォローの状態もここで分かる）
  const { data: viewerResp, loading } = useQuery(folderQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      nanoid: data.nanoid,
      offset: data.page * COLLECTION_WORKS_PER_PAGE,
      limit: COLLECTION_WORKS_PER_PAGE,
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const folder = viewerResp?.folder ?? data.folder

  if (folder === null || folder.user === null) {
    if (authContext.isLoading || loading) {
      return <AppLoadingPage />
    }
    throw new Response(null, { status: 404 })
  }

  return (
    <article className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 pb-10 md:gap-8">
      <CollectionHeader collection={folder} />
      <CollectionWorkList
        works={folder.works}
        page={data.page}
        maxCount={folder.worksCount ?? 0}
        isOwner={authContext.userId === folder.user.id}
      />
    </article>
  )
}

const folderQuery = graphql(
  `query CollectionPage($nanoid: String!, $offset: Int!, $limit: Int!) {
    folder(where: { nanoid: $nanoid }) {
      id
      ...CollectionHeader
      works(offset: $offset, limit: $limit) {
        ...CollectionWorkListItem
      }
    }
  }`,
  [CollectionHeaderFragment, CollectionWorkListItemFragment],
)
