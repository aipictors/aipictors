import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  UserCollectionList,
  UserUserFoldersItemFragment,
} from "~/routes/($lang)._main.users.$user.collections/components/user-collection-list"

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

  const foldersResp = await loaderClient.query({
    query: userFoldersQuery,
    variables: {
      offset: 0,
      limit: 32,
      userId: userIdResp.data.user.id,
    },
  })

  if (foldersResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    folders: foldersResp.data.user.folders,
  }
}

export default function UserAlbums() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserCollectionList folders={data.folders} />
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

export const userFoldersQuery = graphql(
  `query Folders($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      folders(offset: $offset, limit: $limit) {
        ...UserUserFoldersItem
      }
    }
  }`,
  [UserUserFoldersItemFragment],
)
