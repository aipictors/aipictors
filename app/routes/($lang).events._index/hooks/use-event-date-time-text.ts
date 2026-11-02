import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * イベントの日時（日本時間の壁時計を UTC として扱った UNIX 秒）を表示用の文字列にする。
 * サーバー（UTC）とブラウザのどちらでも同じ文字になるようにする
 * @param time
 * @returns
 */
export function useEventDateTimeText(time: number) {
  const t = useTranslation()

  const japanTime = toJstDisplayDate((time - 9 * 60 * 60) * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}
