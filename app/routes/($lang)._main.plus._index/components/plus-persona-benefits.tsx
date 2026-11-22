import { BrushIcon, CheckIcon, HeartIcon, ImageUpIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { planCtaClassName } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { toDailyGachaPulls } from "~/routes/($lang)._main.plus._index/components/plus-coin-uses"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type PersonaId = "create" | "post" | "fan"

/**
 * 「どんな使い方をする人か」を選ぶと、その人にうれしい特典とおすすめのプランを出す
 * （生成しない人にもプランの良さが伝わるように）
 */
export function PlusPersonaBenefits() {
  const t = useTranslation()
  const [persona, setPersona] = useState<PersonaId>("create")
  const free = getPlanSpec("FREE")
  const lite = getPlanSpec("LITE")
  const standard = getPlanSpec("STANDARD")
  const premium = getPlanSpec("PREMIUM")

  const personas: Array<{
    id: PersonaId
    icon: typeof BrushIcon
    label: { ja: string; en: string }
    recommended: PlanKey
    headline: { ja: string; en: string }
    points: Array<{ ja: string; en: string }>
  }> = [
    {
      id: "create",
      icon: BrushIcon,
      label: { ja: "AIで生成する", en: "I generate" },
      recommended: "STANDARD",
      headline: {
        ja: "待ち時間が減って、作れる枚数が増える",
        en: "Less waiting, way more images",
      },
      points: [
        {
          ja: `1回のクリックで${lite.imagesPerRequest}枚（無料は1枚）、1日最大${premium.dailyImages}枚`,
          en: `${lite.imagesPerRequest} images per click (1 on Free), up to ${premium.dailyImages} a day`,
        },
        {
          ja: "スタンダード以上は混んでいても最優先で生成・高速モード・予約生成",
          en: "Standard and up: first in the queue, fast mode and scheduled generation",
        },
        {
          ja: "画像から生成・部分修正・Gemini Nano Banana",
          en: "Image-to-image, inpainting and Gemini Nano Banana",
        },
        {
          ja: `LoRA を最大${standard.loraModels}個、モデル登録は毎月最大${premium.modelSlots}GB`,
          en: `Up to ${standard.loraModels} LoRAs and ${premium.modelSlots}GB of model uploads a month`,
        },
      ],
    },
    {
      id: "post",
      icon: ImageUpIcon,
      label: { ja: "作品を投稿する", en: "I post my work" },
      recommended: "STANDARD",
      headline: {
        ja: "作品をもっと多くの人に見てもらえる",
        en: "Get your work in front of more people",
      },
      points: [
        {
          ja: "スタンダード以上は毎週1作品、ホームのいちばん目立つ「クリエイターの宣伝」に7日間",
          en: "Standard and up: one work a week in “From our creators” at the top of the home page for 7 days",
        },
        {
          ja: "名前の横に認証マーク",
          en: "A verified badge next to your name",
        },
        {
          ja: `動画は1本${lite.video.maxDurationSeconds}秒・1日${lite.video.dailyTotalDurationSeconds}秒まで投稿できる（無料は${free.video.maxDurationSeconds}秒）`,
          en: `Post videos up to ${lite.video.maxDurationSeconds}s each, ${lite.video.dailyTotalDurationSeconds}s a day (${free.video.maxDurationSeconds}s on Free)`,
        },
        {
          ja: "生成した画像をそのまま投稿。保存期間も最大2年に",
          en: "Post straight from your generations, kept for up to 2 years",
        },
      ],
    },
    {
      id: "fan",
      icon: HeartIcon,
      label: { ja: "見る・推す", en: "I browse & support" },
      recommended: "LITE",
      headline: {
        ja: "広告なしで見て、毎日のコインで推せる",
        en: "No ads, and daily coins to support with",
      },
      points: [
        {
          ja: "サイトの広告がすべて消える",
          en: "Every ad on the site disappears",
        },
        {
          ja: `毎日${toMoneyNumberText(lite.dailyFreeCoins)}〜${toMoneyNumberText(premium.dailyFreeCoins)}フリーコイン。推しやリクエストに使える`,
          en: `${toMoneyNumberText(lite.dailyFreeCoins)}–${toMoneyNumberText(premium.dailyFreeCoins)} free coins every day for support and requests`,
        },
        {
          ja: `毎日のフリーコインで限定枠ガチャを1日${toDailyGachaPulls(lite.dailyFreeCoins)}回引ける`,
          en: `Daily free coins cover ${toDailyGachaPulls(lite.dailyFreeCoins)} limited-frame gacha pull a day`,
        },
        {
          ja: `プラン限定のアイコン枠（ライト${lite.avatarFrames}種〜プレミアム${premium.avatarFrames}種）と認証マーク`,
          en: `Plan-only avatar frames (${lite.avatarFrames} on Lite up to ${premium.avatarFrames} on Premium) and a verified badge`,
        },
      ],
    },
  ]

  const current = personas.find((item) => item.id === persona) ?? personas[0]
  const plan = getPlanSpec(current.recommended)
  // 1 か月を 30 日として 1 日あたりの目安
  const perDay = Math.round(plan.price / 30)

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-bold text-xl md:text-2xl">
          {t(
            "あなたの使い方に合うプランは？",
            "Which plan fits how you use Aipictors?",
          )}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "生成しない人にも、うれしい特典があります。",
            "There's plenty here even if you never generate.",
          )}
        </p>
      </div>
      <div
        role="tablist"
        aria-label={t("使い方", "How you use it")}
        className="grid grid-cols-3 gap-1 rounded-2xl border bg-muted/40 p-1"
      >
        {personas.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === persona}
            onClick={() => {
              setPersona(item.id)
              trackGrowthEvent("plus_persona", item.id)
            }}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 font-bold text-xs transition-colors sm:flex-row sm:justify-center sm:text-sm",
              item.id === persona
                ? "bg-background text-violet-700 shadow-sm dark:text-violet-300"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {t(item.label.ja, item.label.en)}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="grid gap-5 rounded-3xl border bg-gradient-to-br from-violet-500/10 via-transparent to-sky-500/10 p-5 md:grid-cols-[1fr_240px] md:items-center md:p-7"
      >
        <div className="space-y-3">
          <p className="font-extrabold text-lg md:text-xl">
            {t(current.headline.ja, current.headline.en)}
          </p>
          <ul className="space-y-2">
            {current.points.map((point) => (
              <li key={point.ja} className="flex items-start gap-2 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
                <span>{t(point.ja, point.en)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-background/80 p-4 text-center backdrop-blur">
          <p className="text-muted-foreground text-xs">
            {t("おすすめ", "Our pick")}
          </p>
          <p className="font-extrabold text-xl">{t(plan.name, plan.enName)}</p>
          <p className="mt-1 font-bold text-2xl tabular-nums">
            {`¥${toMoneyNumberText(plan.price)}`}
            <span className="font-normal text-muted-foreground text-xs">
              {t("/月", "/mo")}
            </span>
          </p>
          <p className="text-muted-foreground text-xs">
            {t(`1日あたり約${perDay}円`, `About ¥${perDay} a day`)}
          </p>
          <Button
            asChild
            size="lg"
            className={cn(planCtaClassName, "mt-3 w-full")}
          >
            <a
              href="#plans"
              onClick={() =>
                trackGrowthEvent("plus_persona_cta", current.recommended)
              }
            >
              {t(`${plan.name}を見る`, `See ${plan.enName}`)}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
