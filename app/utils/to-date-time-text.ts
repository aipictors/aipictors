import { format } from "date-fns"
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
    ? t(format(date, "yyyy/MM/dd HH:mm"), format(date, "yyyy/MM/dd HH:mm"))
    : t(
        format(date, "yyyy年MM月dd日 HH時mm分"),
        format(date, "yyyy/MM/dd HH:mm"),
      )
}
