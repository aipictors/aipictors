import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  GENERATION_NOTICE_KV_KEY,
  parseGenerationNotice,
} from "~/utils/generation-notice"

/**
 * 生成画面のお知らせ（メンテナンス中・不安定・仕組みを変えた直後など）
 * GET /api/generation/notice → { data: GenerationNotice | null }
 *
 * 中身は KV（PAGE_CACHE）の generation-notice に運営が置く（scripts/generation-notice.sh）。
 * 期間（startsAt〜endsAt）の外なら null。エッジに 30 秒キャッシュする。
 */

const CACHE_SECONDS = 30

type KvNamespace = {
  get(
    key: string,
    options: { type: "text"; cacheTtl?: number },
  ): Promise<string | null>
}

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=0, s-maxage=${CACHE_SECONDS}`,
    },
  })

export async function loader(props: LoaderFunctionArgs) {
  const env = (
    props.context as { cloudflare?: { env?: { PAGE_CACHE?: KvNamespace } } }
  )?.cloudflare?.env
  const kv = env?.PAGE_CACHE
  if (!kv) return json({ data: null })

  try {
    const raw = await kv.get(GENERATION_NOTICE_KV_KEY, {
      type: "text",
      cacheTtl: CACHE_SECONDS,
    })
    const notice = parseGenerationNotice(raw)
    if (notice === null) return json({ data: null })
    const now = Date.now()
    if (notice.startsAt && Date.parse(notice.startsAt) > now) {
      return json({ data: null })
    }
    if (notice.endsAt && Date.parse(notice.endsAt) <= now) {
      return json({ data: null })
    }
    return json({ data: notice })
  } catch {
    return json({ data: null })
  }
}
