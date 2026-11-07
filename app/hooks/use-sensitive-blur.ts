import { useRouteLoaderData } from "@remix-run/react"
import { useCallback, useMemo, useSyncExternalStore } from "react"
import {
  parseSensitiveBlur,
  SENSITIVE_BLUR_COOKIE,
} from "~/utils/sensitive-blur"

const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

const getSnapshot = () => parseSensitiveBlur(document.cookie)

type RootData =
  | { blurSensitive?: boolean; sensitiveWorkIds?: string[] }
  | undefined

/**
 * センシティブな作品をぼかすか（ON/OFF）と、その切り替え
 */
export const useSensitiveBlurSetting = () => {
  const rootData = useRouteLoaderData("root") as RootData
  const serverValue = rootData?.blurSensitive ?? true

  const isBlur = useSyncExternalStore(subscribe, getSnapshot, () => serverValue)

  const setBlur = useCallback((value: boolean) => {
    document.cookie = `${SENSITIVE_BLUR_COOKIE}=${value ? "on" : "off"}; path=/; max-age=31536000; samesite=lax`
    for (const listener of listeners) listener()
  }, [])

  return { isBlur, setBlur }
}

const emptySet = new Set<string>()

/**
 * この作品をセンシティブとしてぼかすか
 */
export const useIsSensitiveBlurred = (workId: string | number | undefined) => {
  const rootData = useRouteLoaderData("root") as RootData
  const ids = rootData?.sensitiveWorkIds
  const idSet = useMemo(() => (ids ? new Set(ids) : emptySet), [ids])
  const { isBlur } = useSensitiveBlurSetting()
  if (!isBlur || workId === undefined) return false
  return idSet.has(workId.toString())
}
