import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)

  const pathname = url.pathname

  if (/^\/works\/\d+$/.test(pathname)) {
    return await handlePostsRedirect(url)
  }

  return null
}

const handlePostsRedirect = async (url: URL) => {
  const postId = url.pathname.split("/").pop()

  if (!postId) {
    throw new Response(null, { status: 404 })
  }

  return redirect(`/posts/${postId}`, { status: 301 })
}
