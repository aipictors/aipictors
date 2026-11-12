import { useEffect } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { trackGrowthEvent } from "~/utils/track-growth-event"

const STORAGE_KEY = "aipictors-generation-plan-hint-date"

/**
 * 今日（日本時間）の日付。案内は 1 日 1 回まで
 */
export const toJstDateText = (now: Date) =>
  new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

/**
 * 無料の人の生成が終わった直後に、プランなら 1 回で 4 枚作れることを 1 行で知らせる（1 日 1 回）
 * 画像が出来上がった瞬間がいちばん「もっと作りたい」と思う場面なので、ここで伝える
 */
export function useGenerationPlanHint(isEnabled: boolean) {
  const t = useTranslation()

  useEffect(() => {
    if (!isEnabled) return
    const onCompleted = () => {
      const today = toJstDateText(new Date())
      try {
        if (window.localStorage.getItem(STORAGE_KEY) === today) return
        window.localStorage.setItem(STORAGE_KEY, today)
      } catch (_error) {
        // 覚えておけないときは出さない（終わるたびに出てしまうため）
        return
      }
      trackGrowthEvent("gen_done_view", "free")
      toast(
        t(
          "生成できました。プランなら同じ1回で4枚まとめて作れます（初月半額）",
          "Done! With a plan, one click makes 4 images (50% off your first month)",
        ),
        {
          duration: 8000,
          action: {
            label: t("プランを見る", "See plans"),
            onClick: () => {
              trackGrowthEvent("gen_done_click", "free")
              window.open(
                t.isEnglish ? "/en/plus#plans" : "/plus#plans",
                "_blank",
                "noopener",
              )
            },
          },
        },
      )
    }
    window.addEventListener("generation:task-completed", onCompleted)
    return () =>
      window.removeEventListener("generation:task-completed", onCompleted)
  }, [isEnabled, t.isEnglish])
}
