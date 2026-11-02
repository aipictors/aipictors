/**
 * 支援リクエスト（/creator 以下）は廃止した機能で、API にも移動先のページにもあたるものがない
 * ($lang).$id に落ちるとトップへ移されてしまうので、ここで明示的に 404 にする
 */
export async function loader() {
  throw new Response(null, { status: 404 })
}

// 404 のときにサイトのエラーページを出すために必要
export default function Route() {
  return null
}
