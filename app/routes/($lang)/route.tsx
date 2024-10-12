import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"

export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)

  if (url.pathname === "/series") {
    const url = new URL(props.request.url)
    const user = url.searchParams.get("user")
    const id = url.searchParams.get("id")

    if (user === null || id === null) {
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

  if (url.pathname === "/illust") {
    return redirect("/posts/2d", {
      status: 302,
    })
  }

  if (url.pathname === "/stamp-space") {
    return redirect("/stickers", {
      status: 302,
    })
  }

  if (url.pathname === "/real") {
    return redirect("/posts/3d", {
      status: 302,
    })
  }

  if (url.pathname === "/idea") {
    return redirect("/themes", {
      status: 302,
    })
  }

  return null
}

const LoaderAlbumsQuery__DEPRECATED__ = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum( where: $where) {
      user {
        id
      }
      slug
    }
  }`,
)
