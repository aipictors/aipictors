import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { createUserTabMeta } from "~/routes/($lang)._main.users.$user/user-tab-meta"
import {
  UserCollectionList,
  UserUserFoldersItemFragment,
} from "~/routes/($lang)._main.users.$user.collections/components/user-collection-list"

const USER_FOLDERS_PAGE_SIZE = 32

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  // ユーザーの ID とコレクションを 1 回で取る（以前は ID を取ってから一覧を取り直していた）
  const foldersResp = await loaderClient.query({
    query: userFoldersQuery,
    variables: {
      offset: 0,
      limit: USER_FOLDERS_PAGE_SIZE,
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (foldersResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    userId: foldersResp.data.user.id,
    folders: foldersResp.data.user.folders,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserCollectionList
        folders={data.folders}
        userId={data.userId}
        pageSize={USER_FOLDERS_PAGE_SIZE}
      />
    </div>
  )
}

export const userFoldersQuery = graphql(
  `query Folders($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      folders(offset: $offset, limit: $limit) {
        ...UserUserFoldersItem
      }
    }
  }`,
  [UserUserFoldersItemFragment],
)

export const meta = createUserTabMeta("コレクション", "Collections")
