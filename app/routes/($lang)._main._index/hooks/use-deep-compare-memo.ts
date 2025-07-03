import { useRef } from "react"
import isEqual from "lodash/isEqual"

/**
 * 依存配列を「深い比較」で判定してメモ化する React Hook
 *
 * @param factory  メモ化したい値を返すコールバック
 * @param deps     依存配列（オブジェクトや配列でも OK）
 * @returns        メモ化された値
 */
export function useDeepCompareMemo<T>(factory: () => T, deps: unknown[]): T {
  // 直前の依存配列を保持
  const prevDepsRef = useRef<unknown[]>()
  // メモ化された値を保持
  const valueRef = useRef<T>()

  // 初回、または deps が深い比較で変化したときだけ再計算
  if (
    prevDepsRef.current === undefined ||
    !isEqual(prevDepsRef.current, deps)
  ) {
    prevDepsRef.current = deps
    valueRef.current = factory()
  }

  return valueRef.current as T
}
