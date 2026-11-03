import { useEffect, useRef, useState } from "react"

/** 一度に描画を増やす数 */
const REVEAL_STEP = 20
/** 画面の下に来る少し前から描画する */
const REVEAL_ROOT_MARGIN = "0px 0px 1500px 0px"

/**
 * 取得済みの一覧を、スクロールに合わせて少しずつ描画する
 * 通信は増えない。全件を一度に描画しないので、画面の外のアイコン画像も読まずに済む
 */
export function useProgressiveCount(
  total: number,
  initialCount: number,
  resetKey: string,
) {
  const [count, setCount] = useState(initialCount)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 同じ画面のまま別の作品へ移ったら最初から
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey の変化だけで戻す
  useEffect(() => {
    setCount(initialCount)
  }, [resetKey])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || count >= total) {
      return
    }
    // 増やしたあとも見えていれば、作り直した observer がすぐに知らせる
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setCount((value) => value + REVEAL_STEP)
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [count, total])

  return { count, sentinelRef }
}
