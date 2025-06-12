import { useLayoutEffect, useEffect, useRef } from "react"
import { useLocation } from "@remix-run/react"

/**
 * ready=true のタイミングで一度だけ scroll を復元。
 * 保存キーは pathname 固定。console.debug 付き。
 */
export function useScrollRestoration(key: string, ready: boolean) {
  const { pathname } = useLocation()
  const storageKey = `scroll:${key}:${pathname}`
  const restored = useRef(false)

  /* -------- Restore once -------- */
  useLayoutEffect(() => {
    if (!ready || restored.current) return

    const y = Number(sessionStorage.getItem(storageKey) ?? "0")
    console.debug(`[scroll] 🔄 restore ${storageKey} y=${y}`)

    // clamp: y が最大値を超えていたら自動で調整
    const maxY = document.documentElement.scrollHeight - window.innerHeight
    const target = Math.min(y, Math.max(maxY, 0))

    let tries = 0
    const doRestore = () => {
      window.scrollTo(0, target)
      console.debug(
        `[scroll]   ↪ try=${tries} now=${window.scrollY} target=${target}`,
      )
      if (window.scrollY !== target && tries < 4) {
        tries++
        requestAnimationFrame(doRestore)
      }
    }
    requestAnimationFrame(doRestore)

    restored.current = true
  }, [ready, storageKey])

  /* -------- Save on scroll / pagehide -------- */
  useEffect(() => {
    let ticking = false
    const save = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey, String(window.scrollY))
        ticking = false
      })
    }

    window.addEventListener("scroll", save, { passive: true })
    window.addEventListener("pagehide", save)
    return () => {
      window.removeEventListener("scroll", save)
      window.removeEventListener("pagehide", save)
    }
  }, [storageKey])
}
