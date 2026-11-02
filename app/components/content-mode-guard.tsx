import { useLocation, useNavigate } from "@remix-run/react"
import { useEffect, useLayoutEffect, useRef } from "react"
import {
  isR18Path,
  readContentMode,
  toR18Path,
  writeContentMode,
} from "~/utils/content-mode"

const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect

/**
 * R18 に切り替えたら、切り替え直すまで R18 のままにする
 * - リンクを押したとき: 移動する前に /r のページへ置き換える（全年齢のページを経由しない）
 * - コードからの移動（navigate）: 移動した先で /r のページへ置き換える
 * - サイトの外から全年齢のページに来たとき: 開いた URL に従って全年齢にする
 *   （R18 を見たあとに、別の日にトップを開くと R18 が出る、ということにしない）
 */
export function ContentModeGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  const isFirstRenderRef = useRef(true)

  useIsomorphicLayoutEffect(() => {
    const isFirstRender = isFirstRenderRef.current
    isFirstRenderRef.current = false

    if (isR18Path(location.pathname)) {
      writeContentMode("r18")
      return
    }

    if (readContentMode() !== "r18") return

    const target = toR18Path(location.pathname, location.search)
    if (target === null) return

    if (isFirstRender && !isSameSiteReferrer()) {
      writeContentMode("all")
      return
    }

    navigate(`${target}${location.hash}`, { replace: true })
  }, [location.pathname, location.search])

  useEffect(() => {
    const toInternalTarget = (event: Event) => {
      if (readContentMode() !== "r18") return null
      if (!(event.target instanceof Element)) return null
      const anchor = event.target.closest("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return null
      if (anchor.origin !== window.location.origin) return null
      if (anchor.hasAttribute("download")) return null
      const target = toR18Path(anchor.pathname, anchor.search)
      if (target === null) return null
      return { anchor, target: `${target}${anchor.hash}` }
    }

    // 新しいタブで開く・リンクをコピーするときのために、触った時点で href も置き換える
    const onPointerDown = (event: Event) => {
      const found = toInternalTarget(event)
      found?.anchor.setAttribute("href", found.target)
    }

    const onClick = (event: MouseEvent) => {
      const found = toInternalTarget(event)
      if (found === null) return
      const isPlainClick =
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        (found.anchor.target === "" || found.anchor.target === "_self")
      if (!isPlainClick) {
        found.anchor.setAttribute("href", found.target)
        return
      }
      // React に届く前に止めて、置き換えた先へ移動する
      event.preventDefault()
      event.stopPropagation()
      navigate(found.target)
    }

    // React はルート要素で受けるので、window の capture なら先に処理できる
    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("click", onClick, true)
    }
  }, [navigate])

  return null
}

const isSameSiteReferrer = () => {
  try {
    return (
      document.referrer !== "" &&
      new URL(document.referrer).origin === window.location.origin
    )
  } catch {
    return false
  }
}
