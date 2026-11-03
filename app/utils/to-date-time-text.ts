import { formatDate } from "~/utils/format-date"
import { useTranslation } from "~/hooks/use-translation"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 時刻の文字列を返す
 * @param time
 */
export const toDateTimeText: (time: number, isSimple?: boolean) => string = (
  time: number,
  isSimple?: boolean,
): string => {
  const t = useTranslation()

  const date = toJstDisplayDate(time * 1000)
  return isSimple
    ? t(formatDate(date, "yyyy/MM/dd HH:mm"), formatDate(date, "yyyy/MM/dd HH:mm"))
    : t(
        formatDate(date, "yyyy年MM月dd日 HH時mm分"),
        formatDate(date, "yyyy/MM/dd HH:mm"),
      )
}
