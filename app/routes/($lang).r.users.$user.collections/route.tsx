import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, Link, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { graphql } from "gql.tada"
import { UserUserFoldersItemFragment } from "~/routes/($lang)._main.users.$user.collections/components/user-collections-content-body"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"

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
    query: userFoldersAndProfileQuery,
    variables: {
      offset: 0,
      limit: 32,
      userId: userIdResp.data.user.id,
    },
  })

  if (foldersResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: foldersResp.data.user,
    folders: foldersResp.data.user.folders,
  })
}

export default function UserSensitiveAlbums() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={data.user} />
      <div className="flex flex-wrap gap-4">
        {data.folders.map((folder) => (
          <div
            key={folder.id}
            className="h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
          >
            <div className="box-border flex flex-col justify-end">
              <Link to={`/collections/${folder.nanoid}`} className="relative">
                <img
                  className="h-16 w-32 object-cover transition-all hover:scale-110 md:h-32 md:w-64"
                  src={folder.thumbnailImageURL ? folder.thumbnailImageURL : ""}
                  alt={folder.title}
                />
                <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
                  <p className="absolute bottom-1 left-1 text-white">
                    {folder.title}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ))}
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

export const userFoldersAndProfileQuery = graphql(
  `query Folders($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      folders(offset: $offset, limit: $limit) {
        ...UserUserFoldersItem
      }
      ...UserProfileIcon
    }
  }`,
  [UserUserFoldersItemFragment, UserProfileIconFragment],
)
