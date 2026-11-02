/** これより前に押されたものは押し直さない（忘れた頃に動くと驚くので） */
const MAX_PENDING_MS = 8000

type PendingClick = { el: HTMLElement; at: number }

declare global {
  interface Window {
    __aipictorsHydrated?: boolean
    __aipictorsPendingClick?: PendingClick
  }
}

/**
 * hydration の前に押されたボタンを押し直す（覚えるのは app/lib/defer-hydration.ts）
 */
export function replayPendingClick(now: number = Date.now()) {
  window.__aipictorsHydrated = true
  const pending = window.__aipictorsPendingClick
  window.__aipictorsPendingClick = undefined
  if (!pending || !pending.el.isConnected) return false
  if (now - pending.at > MAX_PENDING_MS) return false
  pending.el.click()
  return true
}
