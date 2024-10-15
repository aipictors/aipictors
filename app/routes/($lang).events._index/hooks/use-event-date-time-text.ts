import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"

/**
 * UTC時間から日本時間（UTC+9）に変換
 * @param time
 * @returns
 */
export function useEventDateTimeText(time: number) {
  const t = useTranslation()

  const date = new Date(time * 1000)

  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}
