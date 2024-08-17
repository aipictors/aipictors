import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { createClient } from "~/lib/client"
import { AlbumArticleHeaderFragment } from "~/routes/($lang)._main.albums.$album/components/album-article-header"

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

  const client = createClient()

  const albumResp = await client.query({
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
