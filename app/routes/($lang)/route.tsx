import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"

export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)

  const pathname = url.pathname

  console.log("pathname", pathname)

  const redirectMapping: Record<string, string> = {
    "/illust": "/posts/2d",
    "/stamp-space": "/stickers",
    "/real": "/posts/3d",
    "/idea": "/themes",
  }

  if (/^\/series\/?$/.test(pathname)) {
    return await handleSeriesRedirect(url)
  }

  if (redirectMapping[pathname]) {
    return redirect(redirectMapping[pathname], { status: 302 })
  }

  return null
}

const handleSeriesRedirect = async (url: URL) => {
  const user = url.searchParams.get("user")
  const id = url.searchParams.get("id")

  if (!user || !id) {
    throw new Response(null, { status: 404 })
  }

  const userResp = await loaderClient.query({
    query: userQuery__DEPRECATED__,
    variables: {
      userId: user,
    },
  })

  if (!userResp.data.user) {
    throw new Response(null, { status: 404 })
  }

  const albumResp = await loaderClient.query({
    query: LoaderAlbumsQuery__DEPRECATED__,
    variables: {
      where: {
        userId: userResp.data.user.login,
        link: id,
      },
    },
  })

  const album = albumResp.data.userAlbum

  if (!album) {
    throw new Response(null, { status: 404 })
  }

  return redirect(`/${album.user.login}/albums/${album.slug}`, { status: 302 })
}

const LoaderAlbumsQuery__DEPRECATED__ = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum(where: $where) {
      user {
        id
        login
      }
      slug
    }
  }`,
)

const userQuery__DEPRECATED__ = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      login
    }
  }`,
)
