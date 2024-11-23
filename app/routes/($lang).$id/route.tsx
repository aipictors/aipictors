import { type LoaderFunctionArgs, redirect } from "react-router";

export const loader = async (props: LoaderFunctionArgs) => {
  const url = new URL(props.request.url)

  const pathname = url.pathname

  if (/^\/works\/\d+$/.test(pathname)) {
    return await handlePostsRedirect(url)
  }

  // works/:id のリダイレクト対応
  const worksMatch = pathname.match(/^\/works\/(\d+)\/?$/)
  if (worksMatch) {
    const id = worksMatch[1] // キャプチャしたID
    return redirect(`/posts/${id}`, { status: 301 })
  }

  return redirect("/")
}

const handlePostsRedirect = async (url: URL) => {
  const postId = url.pathname.split("/").pop()

  if (!postId) {
    throw new Response(null, { status: 404 })
  }

  return redirect(`/posts/${postId}`, { status: 301 })
}
