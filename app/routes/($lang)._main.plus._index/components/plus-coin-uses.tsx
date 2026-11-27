import {
  BrushIcon,
  CoinsIcon,
  FrameIcon,
  GiftIcon,
  HandHeartIcon,
  type LucideIcon,
  MegaphoneIcon,
  SparklesIcon,
  WalletIcon,
} from "lucide-react"
import {
  GACHA_FREE_DAILY_LIMIT,
  GACHA_PRICES,
} from "~/components/gacha/gacha-rules"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { HelpFourKoma } from "~/routes/($lang)._main.help._index/components/help-four-koma"
import type { HelpMangaPanel } from "~/routes/($lang)._main.help._index/components/help-sections"
import {
  GENERATION_COIN_COST,
  getPlanSpec,
  PLAN_KEYS,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"

/** その日のフリーコインでガチャを何回引けるか（1 日の上限あり） */
export const toDailyGachaPulls = (coins: number) =>
  Math.min(GACHA_FREE_DAILY_LIMIT, Math.floor(coins / GACHA_PRICES.free))

const PANELS: [HelpMangaPanel, HelpMangaPanel, HelpMangaPanel, HelpMangaPanel] =
  [
    {
      image: "coinuse-1",
      caption: {
        ja: "毎日届くコイン。生成しない日はどうする？",
        en: "Coins arrive every day. Not generating today?",
      },
      bubbles: [
        {
          ja: "生成しないと使い道ない…？",
          en: "No use if I don't generate…?",
          at: "tr",
        },
      ],
    },
    {
      image: "coinuse-2",
      caption: {
        ja: "好きなクリエイターを「推し」て応援。購入コインならクリエイターの報酬に",
        en: "Support creators you love. Bought coins become creator rewards",
      },
      bubbles: [{ ja: "推しにエール！", en: "Go, fave!", at: "tr" }],
    },
    {
      image: "coinuse-3",
      caption: {
        ja: "アイコン枠を買ったり、限定枠ガチャを引いたり",
        en: "Buy avatar frames or pull the frame gacha",
      },
      captionAt: "bottom",
      bubbles: [{ ja: "URきて〜！", en: "Come on, UR!", at: "tl" }],
    },
    {
      image: "coinuse-4",
      caption: {
        ja: "作品の宣伝枠や、クリエイターへのリクエストにも",
        en: "Promote your work or send a paid request",
      },
      bubbles: [
        {
          ja: "使い道いっぱい！",
          en: "So many ways to use them!",
          at: "tr",
        },
      ],
    },
  ]

type CoinUse = {
  id: string
  icon: LucideIcon
  /** アイコンの色 */
  tone: string
  title: { ja: string; en: string }
  body: { ja: string; en: string }
  /** 使えるコイン */
  coins: "both" | "premium"
  to: string
  link: { ja: string; en: string }
}

/**
 * プランのページの「コインの使い道」。4 コマと、使い道すべての一覧、プランごとの 1 日の目安
 */
export function PlusCoinUses() {
  const t = useTranslation()

  const uses: CoinUse[] = [
    {
      id: "generation",
      icon: BrushIcon,
      tone: "text-violet-500 bg-violet-500/10",
      title: { ja: "画像生成", en: "Generate images" },
      body: {
        ja: `通常生成は1枚${GENERATION_COIN_COST.standard}コイン。高解像度・画像から生成・Gemini にも使えます。`,
        en: `${GENERATION_COIN_COST.standard} coins per standard image. Also high-res, image-to-image and Gemini.`,
      },
      coins: "both",
      to: "/generation",
      link: { ja: "生成する", en: "Generate" },
    },
    {
      id: "support",
      icon: HandHeartIcon,
      tone: "text-pink-500 bg-pink-500/10",
      title: { ja: "推し（応援）", en: "Support creators" },
      body: {
        ja: "プロフィールの「推す」や作品ページの「作者を推す」から、クリエイターをコインで応援。フリーコインもプレミアムコインも使え、推しランキングにも載ります（推しはユーザーへの推しだけで、作品への推しは終了しました）。",
        en: 'Support creators with coins from Support on their profile or "Support creator" on a work page. Free and Premium Coins both work, and support counts toward the rankings (support goes to users only; support on works has ended).',
      },
      coins: "both",
      to: "/coin-rankings?kind=received",
      link: { ja: "推しランキングを見る", en: "See the rankings" },
    },
    {
      id: "gacha",
      icon: SparklesIcon,
      tone: "text-amber-500 bg-amber-500/10",
      title: { ja: "スペシャル枠ガチャ", en: "Frame gacha" },
      body: {
        ja: `ガチャでしか出ない限定アイコン枠。フリーコインなら${GACHA_PRICES.free}コインで1日${GACHA_FREE_DAILY_LIMIT}回まで（プレミアムコインなら何回でも）。`,
        en: `Gacha-only avatar frames. With free coins it's ${GACHA_PRICES.free} coins, up to ${GACHA_FREE_DAILY_LIMIT} pull a day (unlimited with premium coins).`,
      },
      coins: "both",
      to: "/gacha",
      link: { ja: "ガチャを引く", en: "Pull the gacha" },
    },
    {
      id: "frames",
      icon: FrameIcon,
      tone: "text-sky-500 bg-sky-500/10",
      title: { ja: "アイコン枠を買う", en: "Buy avatar frames" },
      body: {
        ja: "プロフィールやコメントのアイコンを飾る枠をコインで。スペシャル枠はプレミアムコイン限定です。",
        en: "Frames for your avatar on your profile and comments. Special frames are premium coins only.",
      },
      coins: "both",
      to: "/settings/profile",
      link: { ja: "枠を選ぶ", en: "Pick a frame" },
    },
    {
      id: "promotion",
      icon: MegaphoneIcon,
      tone: "text-orange-500 bg-orange-500/10",
      title: { ja: "作品の宣伝枠", en: "Promote your work" },
      body: {
        ja: "プレミアムコイン500枚で、作品を7日間ホームの「クリエイターの宣伝」に。スタンダード以上なら週1作品が無料です。",
        en: "500 premium coins puts your work in “From our creators” on the home page for 7 days. Free once a week on Standard and up.",
      },
      coins: "premium",
      to: "/promotion",
      link: { ja: "宣伝枠について", en: "About promotions" },
    },
    {
      id: "requests",
      icon: GiftIcon,
      tone: "text-emerald-500 bg-emerald-500/10",
      title: { ja: "リクエスト（依頼）", en: "Paid requests" },
      body: {
        ja: "クリエイターのプランからコインで作品を依頼。フリーかプレミアムのどちらか一方で払います（「プレミアムコインのみ」のプランもあります）。お断り・期限切れなら全額戻ります。",
        en: "Commission a work from a creator's menu, paid with either free or premium coins (some plans take premium only). Declined or expired? You get every coin back.",
      },
      coins: "both",
      to: "/requests",
      link: { ja: "リクエストを見る", en: "Browse requests" },
    },
    {
      id: "rewards",
      icon: WalletIcon,
      tone: "text-teal-600 bg-teal-500/10",
      title: { ja: "受け取って報酬に", en: "Earn rewards" },
      body: {
        ja: "あなたへの推しが購入したプレミアムコインで届くと、1,000コインにつき500円の報酬として振り込まれます（クリエイター報酬に参加した方。R18・R18G の作品を公開している方は対象外）。",
        en: "When you receive support with purchased premium coins, every 1,000 coins pays out ¥500 (Creator Rewards members who don't publish R18 / R18G works).",
      },
      coins: "premium",
      to: "/settings/creator-rewards",
      link: { ja: "クリエイター報酬", en: "Creator Rewards" },
    },
  ]

  return (
    <section id="coin-uses" className="scroll-mt-24 space-y-5">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 font-bold text-amber-600 text-sm dark:text-amber-400">
          <CoinsIcon className="size-4" />
          {t("生成しない人にも", "Even if you don't generate")}
        </p>
        <h2 className="font-bold text-xl md:text-2xl">
          {t(
            "コインの使い道は、生成だけじゃない",
            "Coins aren't just for generating",
          )}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "プランで毎日届くフリーコインは、推し・ガチャ・アイコン枠・リクエストにも使えます。その日のうちに使い切るのがおトクです。",
            "The free coins your plan sends every day also work for support, the gacha, avatar frames and requests. They reset at midnight, so spend them each day.",
          )}
        </p>
      </div>

      <HelpFourKoma
        title={{ ja: "コインの使い道", en: "What can coins do?" }}
        panels={PANELS}
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {uses.map((use) => (
          <li
            key={use.id}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border bg-card p-4",
              // 7 つ目（受け取る側の使い道）は横いっぱいにして、一覧の終わりをそろえる
              use.id === "rewards" &&
                "bg-gradient-to-r from-teal-500/10 to-transparent sm:col-span-2 lg:col-span-3",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  use.tone,
                )}
              >
                <use.icon className="size-5" />
              </span>
              <p className="font-bold">{t(use.title.ja, use.title.en)}</p>
              <span
                className={cn(
                  "ml-auto shrink-0 rounded-full px-2 py-0.5 font-bold text-[10px]",
                  use.coins === "both"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
                )}
              >
                {use.coins === "both"
                  ? t("フリーコインOK", "Free coins OK")
                  : t("プレミアムコイン", "Premium coins")}
              </span>
            </div>
            <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
              {t(use.body.ja, use.body.en)}
            </p>
            <Link
              to={use.to}
              onClick={() => trackGrowthEvent("plus_coin_use_click", use.id)}
              className="font-bold text-sm text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              {t(use.link.ja, use.link.en)}
              {" →"}
            </Link>
          </li>
        ))}
      </ul>

      <PlusDailyCoinTable />
    </section>
  )
}

/**
 * プランごとに、毎日のフリーコインでできることの目安
 */
function PlusDailyCoinTable() {
  const t = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border">
      <p className="border-b bg-muted/50 px-4 py-2 font-bold text-sm">
        {t(
          "毎日のフリーコインで、1日にできることの目安",
          "What your daily free coins cover",
        )}
      </p>
      <div>
        <table className="w-full text-center text-xs sm:text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs">
              <th className="px-2 py-2 sm:px-3 text-left font-medium">
                {t("プラン", "Plan")}
              </th>
              <th className="px-2 py-2 sm:px-3 font-medium">
                {t("毎日のコイン", "Daily coins")}
              </th>
              <th className="px-2 py-2 sm:px-3 font-medium">
                {t("全部生成なら", "All on images")}
              </th>
              <th className="px-2 py-2 sm:px-3 font-medium">
                {t("全部ガチャなら", "All on gacha")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PLAN_KEYS.map((plan) => {
              const spec = getPlanSpec(plan)
              const isFree = plan === "FREE"
              return (
                <tr
                  key={plan}
                  className={cn(plan === "STANDARD" && "bg-violet-500/5")}
                >
                  <td className="px-2 py-2.5 sm:px-3 text-left font-bold">
                    {t(spec.name, spec.enName)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 sm:px-3 tabular-nums",
                      !isFree && "font-bold",
                    )}
                  >
                    {toMoneyNumberText(spec.dailyFreeCoins)}
                  </td>
                  <td className="px-2 py-2.5 sm:px-3 tabular-nums">
                    {t(`${spec.dailyImages}枚`, `${spec.dailyImages} images`)}
                  </td>
                  <td className="px-2 py-2.5 sm:px-3 tabular-nums">
                    {t(
                      `${toDailyGachaPulls(spec.dailyFreeCoins)}回`,
                      `${toDailyGachaPulls(spec.dailyFreeCoins)} pulls`,
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t px-4 py-2 text-muted-foreground text-xs leading-relaxed">
        {t(
          "生成・推し・ガチャなどに好きに分けて使えます。毎日のフリーコインはその日の24時（日本時間）に失効します。",
          "Split them however you like across images, support and the gacha. Daily free coins expire at midnight JST.",
        )}
      </p>
    </div>
  )
}
