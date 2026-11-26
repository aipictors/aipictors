import { useEffect, useState } from "react"
import { getUserModelsAuthHeaders } from "~/lib/user-models/client"

/**
 * 作品がオリジナルか二次創作かの運営の判定（作品のタグとは別に、モデレーターが管理画面で付ける）
 * ORIGINAL = オリジナル（作品ページにバッジ）、FAN_WORK = 二次創作、null = 未判定（推しは今までどおりタグで見る）
 */
export type WorkOriginalJudgment = "ORIGINAL" | "FAN_WORK"

export type WorkOriginalJudgmentMap = Record<
  string,
  { judgment: WorkOriginalJudgment }
>

export type WorkOriginalJudgmentDetail = {
  judgment: WorkOriginalJudgment
  note: string | null
  judgedBy: string
  judgedAt: number
}

export type WorkOriginalJudgmentLog = {
  judgment: WorkOriginalJudgment | null
  note: string | null
  judgedBy: string
  judgedAt: number
}

type Envelope<T> = { error: string | null; data: T | null }

const post = async <T>(body: unknown, auth: boolean): Promise<T> => {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(auth ? await getUserModelsAuthHeaders(true) : {}),
  }
  const response = await fetch("/api/work-original-judgments", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = (await response.json().catch(() => null)) as Envelope<T> | null
  if (!response.ok || !json || json.error) {
    throw new Error(json?.error ?? `通信に失敗しました（${response.status}）`)
  }
  return json.data as T
}

/** 同じ作品の判定を作品ページの複数の場所（バッジ・推すボタン・コメント欄）から読んでも 1 回にする */
const cache = new Map<string, Promise<WorkOriginalJudgment | null>>()

export const fetchWorkOriginalJudgment = (
  workId: string,
): Promise<WorkOriginalJudgment | null> => {
  const cached = cache.get(workId)
  if (cached) return cached
  const promise = post<WorkOriginalJudgmentMap>(
    { op: "list", workIds: [workId] },
    false,
  )
    .then((map) => map?.[workId]?.judgment ?? null)
    .catch(() => {
      cache.delete(workId)
      return null
    })
  cache.set(workId, promise)
  return promise
}

/**
 * 作品の運営の判定。読み込み中・失敗・未判定は null
 */
export function useWorkOriginalJudgment(workId: string | null | undefined) {
  const [judgment, setJudgment] = useState<WorkOriginalJudgment | null>(null)
  useEffect(() => {
    setJudgment(null)
    if (!workId) return
    let active = true
    fetchWorkOriginalJudgment(workId).then((value) => {
      if (active) setJudgment(value)
    })
    return () => {
      active = false
    }
  }, [workId])
  return judgment
}

/** 管理画面: 作品ごとの判定（メモ・判定した人・日時つき） */
export const fetchWorkOriginalJudgmentsForAdmin = (workIds: string[]) =>
  post<Record<string, WorkOriginalJudgmentDetail>>(
    { op: "adminList", workIds },
    true,
  )

/** 管理画面: 判定を付ける・変える・外す（null） */
export const setWorkOriginalJudgment = async (props: {
  workId: string
  judgment: WorkOriginalJudgment | null
  note?: string | null
}) => {
  const result = await post<WorkOriginalJudgmentDetail | null>(
    { op: "set", ...props },
    true,
  )
  cache.delete(props.workId)
  return result
}

/** 管理画面: 判定の記録（新しい順） */
export const fetchWorkOriginalJudgmentLogs = (workId: string) =>
  post<WorkOriginalJudgmentLog[]>({ op: "logs", workId }, true)
