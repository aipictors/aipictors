import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { ALBUM_WORKS_LIMIT } from "~/routes/($lang)._main.help._index/components/help-guide-meta"
import {
  GENERATION_COIN_COST,
  getPlanSpec,
  PLAN_KEYS,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { RETENTION_DAYS } from "~/routes/($lang).generation._index/utils/generation-retention"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"

const toNumber = (value: number) => value.toLocaleString("en-US")

/**
 * 数字の早見表。値はプランのページ・生成画面・サーバーと同じ定数から取る（ここに数字を直書きしない）
 */
export function HelpQuickFacts() {
  const t = useTranslation()
  const specs = PLAN_KEYS.map((plan) => getPlanSpec(plan))

  const retentionText = (plan: PlanKey) => {
    const days = RETENTION_DAYS[plan]
    return days >= 365
      ? t(`${days / 365}年`, `${days / 365} yr`)
      : t(`${Math.round(days / 30)}か月`, `${Math.round(days / 30)} mo`)
  }

  const yesNo = (value: boolean) => (value ? "○" : "—")

  const planRows: Array<{ label: string; value: (plan: PlanKey) => string }> = [
    {
      label: t("月額（税込）", "Monthly (tax incl.)"),
      value: (plan) => {
        const price = getPlanSpec(plan).price
        return price === 0
          ? t("無料", "Free")
          : t(
              `${toNumber(price)}円`,
              `¥${toNumber(price)} (${toApproxUsdText(price)})`,
            )
      },
    },
    {
      label: t("毎日のフリーコイン", "Daily free coins"),
      value: (plan) => toNumber(getPlanSpec(plan).dailyFreeCoins),
    },
    {
      label: t("1 日の通常生成の目安", "Standard images per day"),
      value: (plan) => toNumber(getPlanSpec(plan).dailyImages),
    },
    {
      label: t("1 回の生成枚数（通常）", "Images per click (standard)"),
      value: (plan) => toNumber(getPlanSpec(plan).imagesPerRequest),
    },
    {
      label: t("同時に生成できる数", "Generations at once"),
      value: (plan) => toNumber(getPlanSpec(plan).concurrentTasks),
    },
    {
      label: t("生成の順番（混雑時）", "Queue order when busy"),
      value: (plan) =>
        ({
          normal: t("通常", "Normal"),
          ahead: t("無料より先", "Before Free"),
          first: t("最優先", "First"),
        })[getPlanSpec(plan).queueOrder],
    },
    {
      label: t("画像から生成・Nano Banana", "Image-to-image, Nano Banana"),
      value: (plan) => yesNo(getPlanSpec(plan).imageToImage),
    },
    {
      label: t(
        "Nano Banana 2・予約生成",
        "Nano Banana 2, scheduled generation",
      ),
      value: (plan) => {
        const spec = getPlanSpec(plan)
        return yesNo(spec.nanoBanana2 && spec.reservation)
      },
    },
    {
      label: t(
        "Gemini をフリーコインで（週）",
        "Gemini on free coins (per week)",
      ),
      value: (plan) => {
        const count = getPlanSpec(plan).geminiWeeklyImages
        return count > 0 ? toNumber(count) : "—"
      },
    },
    {
      label: t(
        "生成画像の保存期間（2027/1/1 から）",
        "Image retention (from Jan 1, 2027)",
      ),
      value: retentionText,
    },
    {
      label: t("保護できる生成画像", "Protected images"),
      value: (plan) => {
        const count = getPlanSpec(plan).favoriteHistories
        return count > 0 ? toNumber(count) : "—"
      },
    },
    {
      label: t("シリーズに入れられる作品", "Works per series"),
      value: (plan) => toNumber(ALBUM_WORKS_LIMIT[plan]),
    },
    {
      label: t("動画（1 本 / 1 日合計）", "Video (each / per day)"),
      value: (plan) => {
        const video = getPlanSpec(plan).video
        return t(
          `${video.maxDurationSeconds}秒 / ${video.dailyTotalDurationSeconds}秒`,
          `${video.maxDurationSeconds}s / ${video.dailyTotalDurationSeconds}s`,
        )
      },
    },
    {
      label: t("宣伝枠の特典", "Promotion slot perk"),
      // 宣伝枠の特典はスタンダード・プレミアム（/promotion と利用規約）
      value: (plan) =>
        plan === "STANDARD" || plan === "PREMIUM"
          ? t("週 1 作品", "1 a week")
          : "—",
    },
    {
      label: t("広告の非表示・認証マーク", "No ads, verified badge"),
      value: (plan) => yesNo(getPlanSpec(plan).noAdvertisement),
    },
  ]

  const coinRows = [
    {
      label: t("毎日のフリーコイン", "Daily free coins"),
      value: t(
        "その日の 24 時（日本時間）に失効。翌日に持ち越せない",
        "Expire at midnight JST the same day; no carry-over",
      ),
    },
    {
      label: t(
        "推しで受け取ったフリーコイン",
        "Free coins received as support",
      ),
      value: t(
        "受け取りから 30 日（1 日 300 枚まで）",
        "30 days from receipt (up to 300 a day)",
      ),
    },
    {
      label: t("購入したプレミアムコイン", "Purchased premium coins"),
      value: t("購入日から 3 か月", "3 months from purchase"),
    },
    {
      label: t("使われる順番（生成）", "Spending order (generation)"),
      value: t(
        "フリーコイン → 足りない分だけプレミアムコイン。同じ種類は期限の近い順",
        "Free coins first, then premium for the rest; soonest-expiring first",
      ),
    },
    {
      label: t("プレミアムコインの購入", "Buying premium coins"),
      value: t(
        "100 枚 80 円から。1,000 枚以上は 1 割おまけ",
        `From 100 for ${toApproxUsdText(80)} (¥80); 10% extra on 1,000+`,
      ),
    },
    {
      label: t("推しの pt", "Support pt"),
      value: t(
        "フリー 1 枚 = 1pt、プレミアム 1 枚 = 10pt",
        "Free coin = 1pt, premium coin = 10pt",
      ),
    },
  ]

  const costRows = [
    { label: t("通常", "Standard"), value: GENERATION_COIN_COST.standard },
    {
      label: t("高解像度（1 回 1 枚）", "High resolution (1 per click)"),
      value: GENERATION_COIN_COST.highResolution,
    },
    {
      label: t("画像から生成（1 回 1 枚）", "Image-to-image (1 per click)"),
      value: GENERATION_COIN_COST.imageToImage,
    },
    { label: "Nano Banana", value: GENERATION_COIN_COST.nanoBanana },
    { label: "Nano Banana 2", value: GENERATION_COIN_COST.nanoBanana2 },
  ]

  return (
    <section
      id="numbers"
      aria-labelledby="help-numbers-title"
      className="scroll-mt-20 space-y-4"
    >
      <div className="space-y-1">
        <h2 id="help-numbers-title" className="font-bold text-2xl">
          {t("数字の早見表", "Quick reference")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "プラン・コイン・上限をまとめました。くわしい条件は各章とプランのページを見てください。",
            "Plans, coins and limits at a glance. See each section and the plans page for details.",
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[520px] text-xs sm:text-sm">
          <caption className="p-3 text-left font-semibold">
            {t("プランごとの違い", "By plan")}
          </caption>
          <thead>
            <tr className="border-t bg-muted/50">
              <th
                scope="col"
                className="sticky left-0 bg-muted p-2 text-left font-medium"
              >
                <span className="sr-only">{t("項目", "Item")}</span>
              </th>
              {specs.map((spec) => (
                <th
                  key={spec.plan}
                  scope="col"
                  className="p-2 text-center font-semibold"
                >
                  {t(spec.name, spec.enName)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planRows.map((row) => (
              <tr key={row.label} className="border-t">
                <th
                  scope="row"
                  className="sticky left-0 max-w-36 bg-card p-2 text-left font-normal text-muted-foreground sm:max-w-none"
                >
                  {row.label}
                </th>
                {PLAN_KEYS.map((plan) => (
                  <td key={plan} className="p-2 text-center tabular-nums">
                    {row.value(plan)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card">
          <h3 className="p-3 font-semibold">
            {t("コインの期限と使われる順", "Coin expiry and order")}
          </h3>
          <dl className="divide-y border-t text-sm">
            {coinRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 p-3 sm:grid-cols-[11rem_1fr]"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border bg-card">
          <h3 className="p-3 font-semibold">
            {t("生成 1 枚あたりのコイン", "Coins per generated image")}
          </h3>
          <dl className="divide-y border-t text-sm">
            {costRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 p-3"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-semibold tabular-nums">
                  {toNumber(row.value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="border-t p-3 text-muted-foreground text-xs leading-5">
            {t(
              "失敗した分のコインは使われません。Gemini の週の枠は毎週月曜 0 時（日本時間）に戻り、超えた分はプレミアムコインで作れます。",
              "Failed images use no coins. The weekly Gemini allowance resets Mondays at 0:00 JST; beyond it, use premium coins.",
            )}{" "}
            <Link to="/plus" className="underline">
              {t("プランを比べる", "Compare plans")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
