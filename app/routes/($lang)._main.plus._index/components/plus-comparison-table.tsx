import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { CheckIcon, ChevronDownIcon, MinusIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  PLAN_KEYS,
  type PlanKey,
  type PlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

type Row = {
  label: string
  value(spec: PlanSpec): string | boolean
}

/**
 * スマホで最初に見せる行数（月額・枚数・コインなど、選ぶときにまず見る項目）
 */
const MOBILE_ROWS = 10

/**
 * 無料とプランの比較表
 */
export function PlusComparisonTable() {
  const t = useTranslation()
  const specs = PLAN_KEYS.map((plan) => getPlanSpec(plan))
  // スマホでは 4 プランを横に並べると読めないので、無料と選んだプランの 2 つを並べる
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("STANDARD")
  const [isAllRowsOpen, setIsAllRowsOpen] = useState(false)
  const isHiddenOnMobile = (plan: PlanKey) =>
    plan !== "FREE" && plan !== mobilePlan

  const rows: Row[] = [
    {
      label: t("月額（税込）", "Monthly price"),
      value: (spec) =>
        spec.price > 0
          ? t(
              `¥${toMoneyNumberText(spec.price)}`,
              `¥${toMoneyNumberText(spec.price)} (${toApproxUsdText(spec.price)})`,
            )
          : `¥${toMoneyNumberText(spec.price)}`,
    },
    {
      label: t("生成画像の保存期間", "How long your images are kept"),
      value: (spec) =>
        ({
          FREE: t("3か月", "3 months"),
          LITE: t("6か月", "6 months"),
          STANDARD: t("1年", "1 year"),
          PREMIUM: t("2年", "2 years"),
        })[spec.plan],
    },
    {
      label: t("生成の順番", "Place in the queue"),
      value: (spec) =>
        ({
          normal: t("通常", "Standard queue"),
          ahead: t("無料より先", "Ahead of free"),
          first: t("最優先", "First"),
        })[spec.queueOrder],
    },
    {
      label: t("1回の生成枚数", "Images per click"),
      value: (spec) =>
        t(`${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest}`),
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
      label: t("同時に生成できる数", "Generations running at once"),
      value: (spec) =>
        t(`${spec.concurrentTasks}件`, `${spec.concurrentTasks}`),
    },
    {
      label: t("高解像度（1回1枚）", "High resolution (1 per click)"),
      value: () => true,
    },
    {
      label: t("画像から生成（1回1枚）", "Image-to-image (1 per click)"),
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
      label: t(
        "Gemini をフリーコインで作れる枚数（週）",
        "Gemini images on free coins, per week",
      ),
      value: (spec) =>
        spec.geminiWeeklyImages > 0
          ? t(`${spec.geminiWeeklyImages}枚`, `${spec.geminiWeeklyImages}`)
          : false,
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
      label: t("お気に入り履歴", "Saved favorites in history"),
      value: (spec) =>
        spec.favoriteHistories === 0
          ? false
          : t(`${spec.favoriteHistories}件`, `${spec.favoriteHistories}`),
    },
    {
      label: t("モデル登録（みんなのモデル）", "Your own model uploads"),
      value: (spec) => t(`${spec.modelSlots}個`, `${spec.modelSlots}`),
    },
    {
      label: t("広告の非表示", "No ads"),
      value: (spec) => spec.noAdvertisement,
    },
    {
      label: t("宣伝作品（広告枠）", "Promote your work on the home page"),
      value: (spec) =>
        spec.plan === "STANDARD" || spec.plan === "PREMIUM"
          ? t("週1作品・ホームに7日間", "1 a week, shown for 7 days")
          : false,
    },
    {
      label: t("認証マーク", "Verified badge"),
      value: (spec) => spec.badge,
    },
    {
      label: t("限定アイコン枠", "Exclusive avatar frames"),
      value: (spec) =>
        spec.avatarFrames > 0
          ? t(`${spec.avatarFrames}種`, `${spec.avatarFrames}`)
          : false,
    },
    {
      label: t("動画投稿（1本 / 1日合計）", "Video uploads (per video / per day)"),
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
            "Free is enough to get started. Plans give you more images and more tools.",
          )}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label={t("無料と比べるプラン", "Plan to compare with Free")}
        className="flex rounded-full border bg-muted/60 p-1 md:hidden"
      >
        {specs
          .filter((spec) => spec.plan !== "FREE")
          .map((spec) => (
            <button
              key={spec.plan}
              type="button"
              role="radio"
              aria-checked={mobilePlan === spec.plan}
              onClick={() => setMobilePlan(spec.plan)}
              className={cn(
                "h-10 flex-1 rounded-full px-2 font-bold text-xs transition-colors motion-reduce:transition-none",
                mobilePlan === spec.plan
                  ? "bg-background text-violet-700 shadow dark:text-violet-300"
                  : "text-muted-foreground",
              )}
            >
              {t(spec.name, spec.enName)}
            </button>
          ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full table-fixed border-collapse text-sm md:min-w-[560px] md:table-auto">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 w-[44%] bg-muted px-3 py-3 text-left font-medium text-muted-foreground text-xs md:w-auto">
                {t("項目", "Feature")}
              </th>
              {specs.map((spec) => (
                <th
                  key={spec.plan}
                  className={cn(
                    "px-2 py-3 text-center font-bold md:w-[16%]",
                    spec.plan === "STANDARD" &&
                      "md:bg-violet-500/10 md:text-violet-700 md:dark:text-violet-300",
                    spec.plan === mobilePlan &&
                      "max-md:bg-violet-500/10 max-md:text-violet-700 max-md:dark:text-violet-300",
                    isHiddenOnMobile(spec.plan) && "hidden md:table-cell",
                  )}
                >
                  {t(spec.name, spec.enName)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.label}
                className={cn(
                  "border-b last:border-b-0",
                  // スマホでは主な項目だけ先に見せる
                  index >= MOBILE_ROWS && !isAllRowsOpen && "hidden md:table-row",
                )}
              >
                <th className="sticky left-0 z-10 bg-background px-3 py-2.5 text-left font-normal text-xs md:text-sm">
                  {row.label}
                </th>
                {specs.map((spec) => {
                  const value = row.value(spec)
                  return (
                    <td
                      key={spec.plan}
                      className={cn(
                        "px-2 py-2.5 text-center tabular-nums md:whitespace-nowrap",
                        spec.plan === "STANDARD" && "md:bg-violet-500/5",
                        spec.plan === mobilePlan && "max-md:bg-violet-500/5",
                        isHiddenOnMobile(spec.plan) && "hidden md:table-cell",
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
      {!isAllRowsOpen && (
        <button
          type="button"
          onClick={() => setIsAllRowsOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-1 rounded-xl border text-muted-foreground text-sm hover:text-foreground md:hidden"
        >
          {t(
            `すべての項目を見る（全${rows.length}項目）`,
            `Compare all ${rows.length} features`,
          )}
          <ChevronDownIcon className="size-4" />
        </button>
      )}
    </section>
  )
}
