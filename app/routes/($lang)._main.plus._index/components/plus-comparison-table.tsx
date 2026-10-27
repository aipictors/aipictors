import { CheckIcon, MinusIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  PLAN_KEYS,
  type PlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

type Row = {
  label: string
  value(spec: PlanSpec): string | boolean
}

/**
 * 無料とプランの比較表
 */
export function PlusComparisonTable () {
  const t = useTranslation()
  const specs = PLAN_KEYS.map((plan) => getPlanSpec(plan))

  const rows: Row[] = [
    {
      label: t("月額（税込）", "Monthly (tax incl.)"),
      value: (spec) => `¥${toMoneyNumberText(spec.price)}`,
    },
    {
      label: t("1回の生成枚数", "Images per request"),
      value: (spec) => t(`${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest}`),
    },
    {
      label: t("毎日のフリーコイン", "Daily free coins"),
      value: (spec) => toMoneyNumberText(spec.dailyFreeCoins),
    },
    {
      label: t("1日の生成（通常生成）", "Images per day"),
      value: (spec) => t(`${spec.dailyImages}枚`, `${spec.dailyImages}`),
    },
    {
      label: t("同時に生成できる数", "Concurrent requests"),
      value: (spec) => t(`${spec.concurrentTasks}件`, `${spec.concurrentTasks}`),
    },
    {
      label: t("高解像度（1回1枚）", "High resolution (1 per request)"),
      value: () => true,
    },
    {
      label: t("画像から生成（1回1枚）", "Image to image (1 per request)"),
      value: (spec) => spec.imageToImage,
    },
    {
      label: "Gemini Nano Banana",
      value: (spec) => spec.nanoBanana,
    },
    {
      label: "Nano Banana 2",
      value: (spec) => spec.nanoBanana2,
    },
    {
      label: t("高速生成モード", "Fast mode"),
      value: (spec) => spec.fastMode,
    },
    {
      label: t("予約生成", "Scheduled generation"),
      value: (spec) => spec.reservation,
    },
    {
      label: t("LoRAモデル", "LoRA models"),
      value: (spec) => t(`${spec.loraModels}個`, `${spec.loraModels}`),
    },
    {
      label: t("お気に入り履歴", "Favorite history"),
      value: (spec) =>
        spec.favoriteHistories === 0
          ? false
          : t(`${spec.favoriteHistories}件`, `${spec.favoriteHistories}`),
    },
    {
      label: t("モデル登録（みんなのモデル）", "Model uploads"),
      value: (spec) => t(`${spec.modelSlots}個`, `${spec.modelSlots}`),
    },
    {
      label: t("広告の非表示", "Ad-free"),
      value: (spec) => spec.noAdvertisement,
    },
    {
      label: t("認証マーク", "Verified badge"),
      value: (spec) => spec.badge,
    },
    {
      label: t("動画投稿（1本 / 1日合計）", "Video (per video / daily)"),
      value: (spec) =>
        t(
          `${spec.video.maxDurationSeconds}秒 / ${spec.video.dailyTotalDurationSeconds}秒`,
          `${spec.video.maxDurationSeconds}s / ${spec.video.dailyTotalDurationSeconds}s`,
        ),
    },
  ]

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-bold text-xl md:text-2xl">
          {t("プランの比較", "Compare plans")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "無料でも生成できます。プランに加入すると、生成できる枚数と使える機能が増えます。",
            "You can generate for free. Plans add more images and features.",
          )}
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted px-3 py-3 text-left font-medium text-muted-foreground text-xs">
                {t("項目", "Feature")}
              </th>
              {specs.map((spec) => (
                <th
                  key={spec.plan}
                  className={cn(
                    "px-2 py-3 text-center font-bold",
                    spec.plan === "STANDARD" &&
                      "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                  )}
                >
                  {t(spec.name, spec.enName)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <th className="sticky left-0 z-10 bg-background px-3 py-2.5 text-left font-normal text-xs md:text-sm">
                  {row.label}
                </th>
                {specs.map((spec) => {
                  const value = row.value(spec)
                  return (
                    <td
                      key={spec.plan}
                      className={cn(
                        "whitespace-nowrap px-2 py-2.5 text-center tabular-nums",
                        spec.plan === "STANDARD" && "bg-violet-500/5",
                      )}
                    >
                      {value === true ? (
                        <CheckIcon
                          className="mx-auto size-4 text-violet-500"
                          aria-label={t("あり", "Yes")}
                        />
                      ) : value === false ? (
                        <MinusIcon
                          className="mx-auto size-4 text-muted-foreground/50"
                          aria-label={t("なし", "No")}
                        />
                      ) : (
                        <span
                          className={cn(
                            spec.plan !== "FREE" && "font-semibold",
                          )}
                        >
                          {value}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
