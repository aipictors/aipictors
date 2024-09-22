import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { AlbumArticleHeaderFragment } from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-header"

/**
 * https://www.aipictors.com/series/?user=${userId}&id=${id}
 * → https://www.aipictors.com/${userId}/albums/${id}
 */
export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)
  const user = url.searchParams.get("user")
  const id = url.searchParams.get("id")

  if (user === null || id === null) {
    throw new Response(null, { status: 404 })
  }

  const albumResp = await loaderClient.query({
    query: LoaderQuery__DEPRECATED__,
    variables: {
      where: {
        userId: user,
        link: id,
      },
    },
  })

  if (albumResp.data.userAlbum === null) {
    throw new Response(null, { status: 404 })
  }

  return redirect(
    `/${albumResp.data.userAlbum.user.id}/albums/${albumResp.data.userAlbum.slug}`,
    {
      status: 302,
    },
  )
}

const LoaderQuery__DEPRECATED__ = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum( where: $where) {
      ...AlbumArticleHeader
    }
  }`,
  [AlbumArticleHeaderFragment],
)
