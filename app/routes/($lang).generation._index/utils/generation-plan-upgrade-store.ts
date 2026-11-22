import { useSyncExternalStore } from "react"

export type GenerationPlanUpgradeRequest = {
  /** 使うのに必要ないちばん下のプラン */
  requiredPlan: "LITE" | "STANDARD"
  /** ダイアログの見出し（例: 画像から生成はライト以上で使えます） */
  title: string
  /** 補足 */
  description?: string
  /** 計測用（どの制限から開いたか） */
  source: string
}

let current: GenerationPlanUpgradeRequest | null = null

const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
}

/**
 * プランが必要な操作をしたときに、プランの案内（そのまま決済へ進める）を開く
 * 以前はトーストで「〇〇以上のプランで使えます」と出すだけで、続ける方法がなかった。
 * 設定の部品・生成ボタンのどちらからでも開けるように、ダイアログは生成画面に 1 つだけ置く
 */
export const openGenerationPlanUpgrade = (
  request: GenerationPlanUpgradeRequest,
) => {
  current = request
  emit()
}

export const closeGenerationPlanUpgrade = () => {
  if (current === null) return
  current = null
  emit()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useGenerationPlanUpgradeRequest() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )
}

/**
 * 生成ボタンの部品は画面の配置によって複数置かれるので、ダイアログを出すのは最初に置かれた 1 つだけにする
 */
const hosts: symbol[] = []

export const registerGenerationPlanUpgradeHost = (id: symbol) => {
  hosts.push(id)
  emit()
  return () => {
    const index = hosts.indexOf(id)
    if (index >= 0) hosts.splice(index, 1)
    emit()
  }
}

export const isGenerationPlanUpgradeHost = (id: symbol) => hosts[0] === id
