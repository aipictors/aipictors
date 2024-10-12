import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"

export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)
  const pathname = url.pathname

  const redirectMapping: Record<string, string> = {
    "/illust": "/posts/2d",
    "/stamp-space": "/stickers",
    "/real": "/posts/3d",
    "/idea": "/themes",
  }

  // マッピングされたパスがあればリダイレクトを行う
  if (redirectMapping[pathname]) {
    return redirect(redirectMapping[pathname], { status: 302 })
  }

  // "/series" の処理だけ特別に扱う
  if (pathname === "/series") {
    return await handleSeriesRedirect(url)
  }

  return null
}

const handleSeriesRedirect = async (url: URL) => {
  const user = url.searchParams.get("user")
  const id = url.searchParams.get("id")

  if (!user || !id) {
    throw new Response(null, { status: 404 })
  }

  const albumResp = await loaderClient.query({
    query: LoaderAlbumsQuery__DEPRECATED__,
    variables: {
      where: {
        userId: user,
        link: id,
      },
    },
  })

  const album = albumResp.data.userAlbum
  if (!album) {
    throw new Response(null, { status: 404 })
  }

  return redirect(`/${album.user.id}/albums/${album.slug}`, { status: 302 })
}

const LoaderAlbumsQuery__DEPRECATED__ = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum(where: $where) {
      user {
        id
      }
      slug
    }
  }`,
)
