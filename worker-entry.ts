// @ts-ignore - `wrangler pages functions build` が書き出す
import pages from "./build/worker/index.js"

type Env = { INTERNAL_PURGE_TOKEN?: string }

type CacheContext = ExecutionContext & {
  cache?: { purge(options: { tags: string[] }): Promise<unknown> }
}

/**
 * 作品の編集・削除のあと、その作品ページのキャッシュを消す（API の Worker から呼ぶ）
 */
const purgeWorkPages = async (
  request: Request,
  env: Env,
  ctx: CacheContext,
) => {
  if (
    !env.INTERNAL_PURGE_TOKEN ||
    request.headers.get("authorization") !==
      `Bearer ${env.INTERNAL_PURGE_TOKEN}`
  ) {
    return new Response("Forbidden", { status: 403 })
  }
  const { workIds } = (await request.json()) as { workIds: number[] }
  await ctx.cache?.purge({ tags: workIds.map((id) => `work-${Number(id)}`) })
  return new Response(null, { status: 204 })
}

export default {
  async fetch(request: Request, env: Env, ctx: CacheContext) {
    if (
      request.method === "POST" &&
      new URL(request.url).pathname === "/__internal/purge-work"
    ) {
      return purgeWorkPages(request, env, ctx)
    }
    const response: Response = await pages.fetch(request, env, ctx)
    // Workers のキャッシュは Cache-Control がないと推定で保存するので、明示したものだけを保存させる
    if (
      response.headers.has("Cache-Control") ||
      response.status === 101
    ) {
      return response
    }
    const uncached = new Response(response.body, response)
    uncached.headers.set("Cache-Control", "private, no-store")
    return uncached
  },
}
