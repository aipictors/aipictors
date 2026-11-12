import { useEffect } from "react"
import { toast } from "sonner"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
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
  const liteOffer = useLiteOffer().offer

  useEffect(() => {
    // お試しか初月半額かが分かってから出す
    if (!isEnabled || liteOffer === "unknown" || liteOffer === "none") return
    const isTrial = liteOffer === "trial"
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
      if (isTrial) trackGrowthEvent("trial_view", "gen_done")
      toast(
        isTrial
          ? t(
              `生成できました。プランなら同じ1回で4枚。ライトは${TRIAL_DAYS}日間無料で試せます（その後 ¥480/月）`,
              `Done! On a plan, the same click makes 4 images. Try Lite free for ${TRIAL_DAYS} days (then ¥480/mo).`,
            )
          : t(
              "生成できました。プランなら同じ1回で4枚まとめて作れます（初月半額）",
              "Done! On a plan, the same click makes 4 images. Your first month is half price.",
            ),
        {
          duration: 8000,
          action: {
            label: t("プランを見る", "See plans"),
            onClick: () => {
              trackGrowthEvent("gen_done_click", "free")
              if (isTrial) trackGrowthEvent("trial_click", "gen_done")
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
  }, [isEnabled, t.isEnglish, liteOffer])
}
