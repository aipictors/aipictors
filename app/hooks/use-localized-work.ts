import { useEffect, useState } from "react"
import { useLocale } from "~/hooks/use-locale"
import {
  applyWorkLocalization,
  fetchWorkLocalization,
  hasWorkLocalization,
  pickWorkLanguage,
  type WorkLocalization,
} from "~/utils/work-localization"

const cache = new Map<string, Promise<WorkLocalization | null>>()

/**
 * 画面の中で開く作品（一覧の拡大表示など）を、ブラウザの言語に合わせる。
 * 作品ページは loader で同じことをする（app/routes/($lang)._main.posts.$post._index/route.tsx）
 */
export function useLocalizedWork<
  T extends Parameters<typeof applyWorkLocalization>[0],
>(work: T | null): T | null {
  const locale = useLocale()
  const [localization, setLocalization] = useState<{
    workId: string
    value: WorkLocalization
  } | null>(null)
  const workId = work && hasWorkLocalization(work) ? work.id : null

  useEffect(() => {
    if (workId === null) return
    let isCurrent = true
    let request = cache.get(workId)
    if (!request) {
      request = fetchWorkLocalization(workId)
      cache.set(workId, request)
    }
    request.then((value) => {
      if (isCurrent && value) setLocalization({ workId, value })
    })
    return () => {
      isCurrent = false
    }
  }, [workId])

  if (!work || !localization || localization.workId !== work.id) return work
  return applyWorkLocalization(
    work,
    localization.value,
    pickWorkLanguage(localization.value, locale, navigator.languages ?? []),
  )
}
