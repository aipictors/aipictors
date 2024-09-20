import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 時刻の文字列を返す
 * @param time
 */
export const toDateTimeText = (time: number) => {
  const t = useTranslation()

  const date = new Date(time * 1000)
  return t(
    format(date, "yyyy年MM月dd日 HH時mm分"),
    format(date, "yyyy/MM/dd HH:mm"),
  )
}
