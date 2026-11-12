import { CoinsIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import {
  GENERATION_COIN_COST,
  getPlanSpec,
  PLAN_KEYS,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

/**
 * コインの仕組み
 */
export function PlusCoinGuide() {
  const t = useTranslation()
  const free = getPlanSpec("FREE")
  const standard = getPlanSpec("STANDARD")

  const costs = [
    {
      label: t("通常生成", "Standard"),
      cost: GENERATION_COIN_COST.standard,
      note: t(
        `プランは1回4枚＝${GENERATION_COIN_COST.standard * 4}コイン、無料は${free.imagesPerRequest}枚＝${GENERATION_COIN_COST.standard * free.imagesPerRequest}コイン`,
        `Plans: 4 images = ${GENERATION_COIN_COST.standard * 4} coins. Free: ${free.imagesPerRequest} image = ${GENERATION_COIN_COST.standard * free.imagesPerRequest} coins`,
      ),
    },
    {
      label: t("高解像度", "High resolution"),
      cost: GENERATION_COIN_COST.highResolution,
      note: t("1回1枚", "1 image per click"),
    },
    {
      label: t("画像から生成", "Image-to-image"),
      cost: GENERATION_COIN_COST.imageToImage,
      note: t("1回1枚・ライト以上", "1 image per click · Lite and up"),
    },
    {
      label: "Gemini Nano Banana",
      cost: GENERATION_COIN_COST.nanoBanana,
      note: t(
        "ライト以上・フリーコインで作れる枚数に1日の枠あり",
        "Lite and up · weekly limit on free coins",
      ),
    },
    {
      label: "Nano Banana 2",
      cost: GENERATION_COIN_COST.nanoBanana2,
      note: t(
        "スタンダード以上・フリーコインで作れる枚数に1日の枠あり",
        "Standard and up · weekly limit on free coins",
      ),
    },
  ]

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-bold text-xl md:text-2xl">
          {t("コインの仕組み", "How coins work")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "毎日0時（日本時間）にフリーコインが届き、生成するとその分だけ使われます。使い切れなかったフリーコインはその日のうちに失効します。",
            "You get free coins every day at midnight Japan time (JST) and spend them as you generate. They don't roll over, so use them the same day.",
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {PLAN_KEYS.map((plan) => {
          const spec = getPlanSpec(plan)
          return (
            <div
              key={plan}
              className="rounded-2xl border bg-card p-3 text-center"
            >
              <p className="font-bold text-sm">{t(spec.name, spec.enName)}</p>
              <p className="mt-1 flex items-center justify-center gap-1 font-extrabold text-xl">
                <CoinsIcon className="size-4 text-amber-500" />
                {toMoneyNumberText(spec.dailyFreeCoins)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(
                  `毎日・通常生成${spec.dailyImages}枚分`,
                  `a day = ${spec.dailyImages} images`,
                )}
              </p>
            </div>
          )
        })}
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <p className="border-b bg-muted/50 px-4 py-2 font-bold text-sm">
          {t("1枚あたりのコイン", "Coins per image")}
        </p>
        <ul className="divide-y">
          {costs.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.note}</p>
              </div>
              <p className="shrink-0 font-bold tabular-nums">
                {t(`${item.cost}コイン`, `${item.cost} coins`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {t(
          "Gemini は1枚の費用が高いため、毎日のフリーコインで作れるのは週にライト5枚・スタンダード20枚・プレミアム40枚まで（Nano Banana 2 はその半分。毎週月曜0時に戻ります）。超えた分はプレミアムコインで作れます。ほかのモデルに枠はありません。",
          "Gemini images cost more to make, so your daily free coins cover a set number each week: 5 on Lite, 20 on Standard, 40 on Premium (half that for Nano Banana 2). The count resets every Monday at midnight JST, and you can use premium coins beyond it. Other models have no weekly limit.",
        )}
      </p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {t(
          `例：スタンダードなら毎日${standard.dailyFreeCoins}コインで、通常生成を1回4枚×${standard.dailyFreeCoins / (GENERATION_COIN_COST.standard * 4)}回（${standard.dailyImages}枚）できます。生成ではフリーコインが先に使われ、足りない分は購入したプレミアムコインから使われます。`,
          `Example: Standard gives you ${standard.dailyFreeCoins} coins a day — that's ${standard.dailyFreeCoins / (GENERATION_COIN_COST.standard * 4)} clicks of 4 images, or ${standard.dailyImages} images. Free coins are always used first, then any premium coins you've bought.`,
        )}
      </p>
    </section>
  )
}
