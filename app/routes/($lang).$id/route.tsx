import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

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

  // 知らない URL をトップへ転送すると検索エンジンには中身のあるページに見えるので、404 にする
  throw new Response("Not Found", { status: 404 })
}

const handlePostsRedirect = async (url: URL) => {
  const postId = url.pathname.split("/").pop()

  if (!postId) {
    throw new Response(null, { status: 404 })
  }

  return redirect(`/posts/${postId}`, { status: 301 })
}
