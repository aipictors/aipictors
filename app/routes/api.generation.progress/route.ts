import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { getSdEndpoints } from "~/lib/server/sd-endpoints.server"

/**
 * 生成中のタスクの途中経過（進み具合・プレビュー画像）
 * GET /api/generation/progress?id=<nanoid>&preview=<前回の id_live_preview>
 *
 * 生成ワーカーは SD に force_task_id = タスクの nanoid を渡しているので、
 * 各 GPU サーバーの /internal/progress にその ID を聞き、持っているサーバーの結果を返す。
 * nanoid は推測できない値なので、知っている人（依頼した本人）だけが見られる。
 */


type SdProgress = {
  active?: boolean
  queued?: boolean
  completed?: boolean
  progress?: number | null
  eta?: number | null
  live_preview?: string | null
  id_live_preview?: number | null
  textinfo?: string | null
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

const fetchProgress = async (
  endpoint: string,
  id: string,
  previewId: number,
): Promise<SdProgress | null> => {
  try {
    const response = await fetch(`${endpoint}/internal/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id_task: id,
        id_live_preview: previewId,
        live_preview: true,
      }),
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return null
    return (await response.json()) as SdProgress
  } catch {
    return null
  }
}

/** 「In queue: 3」などから待ち件数を取り出す */
const toQueuePosition = (textinfo: string | null | undefined) => {
  const match = textinfo?.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id") ?? ""
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    return json({ error: "invalid id", data: null }, 400)
  }
  const previewId = Number.parseInt(url.searchParams.get("preview") ?? "-1", 10)

  const endpoints = getSdEndpoints(context)

  const results = await Promise.all(
    endpoints.map((endpoint) =>
      fetchProgress(endpoint, id, Number.isFinite(previewId) ? previewId : -1),
    ),
  )

  const active = results.find((result) => result?.active)
  if (active) {
    return json({
      error: null,
      data: {
        state: "active",
        progress: Math.max(0, Math.min(1, active.progress ?? 0)),
        eta: active.eta ?? null,
        preview: active.live_preview ?? null,
        previewId: active.id_live_preview ?? -1,
        queuePosition: null,
      },
    })
  }

  const queued = results.find((result) => result?.queued)
  if (queued) {
    return json({
      error: null,
      data: {
        state: "queued",
        progress: 0,
        eta: null,
        preview: null,
        previewId: -1,
        queuePosition: toQueuePosition(queued.textinfo),
      },
    })
  }

  const completed = results.some((result) => result?.completed)
  return json({
    error: null,
    data: {
      // completed: GPU での生成が終わり保存中 / unknown: まだ GPU に渡っていない（順番待ち）
      state: completed ? "completed" : "waiting",
      progress: completed ? 1 : 0,
      eta: null,
      preview: null,
      previewId: -1,
      queuePosition: null,
    },
  })
}
