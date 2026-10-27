import { CrownIcon, ImageIcon, ImagesIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  GENERATION_COIN_COST,
  getPlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"

/**
 * 1回で生成できる枚数の案内
 */
export function GenerationAboutCountSection() {
  const t = useTranslation()
  const free = getPlanSpec("FREE")
  const lite = getPlanSpec("LITE")
  const premium = getPlanSpec("PREMIUM")

  const items = [
    {
      icon: ImagesIcon,
      title: t("無料", "Free"),
      count: free.imagesPerRequest,
      body: t(
        `毎日${free.dailyFreeCoins}フリーコインで、1日${free.dailyImages}枚まで無料で生成できます。`,
        `${free.dailyFreeCoins} free coins daily — up to ${free.dailyImages} images a day.`,
      ),
      isHighlighted: false,
    },
    {
      icon: CrownIcon,
      title: t("プラン加入", "With a plan"),
      count: lite.imagesPerRequest,
      body: t(
        `1回のクリックで${lite.imagesPerRequest}枚まとめて生成。1日最大${premium.dailyImages}枚まで生成できます。`,
        `${lite.imagesPerRequest} images per click, up to ${premium.dailyImages} a day.`,
      ),
      isHighlighted: true,
    },
    {
      icon: ImageIcon,
      title: t("高解像度・画像から生成", "High-res / image to image"),
      count: 1,
      body: t(
        `高解像度（${GENERATION_COIN_COST.highResolution}コイン/枚）と画像から生成（${GENERATION_COIN_COST.imageToImage}コイン/枚・ライト以上）は、1回1枚です。`,
        `High resolution (${GENERATION_COIN_COST.highResolution} coins) and image to image (${GENERATION_COIN_COST.imageToImage} coins, Lite or above) make 1 image per request.`,
      ),
      isHighlighted: false,
    },
  ]

  return (
    <section className="space-y-4">
      <p className="text-center font-bold text-2xl md:text-3xl">
        {t("1回の生成で何枚できる？", "How many images per request?")}
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className={cn(
              "rounded-2xl border bg-card p-5",
              item.isHighlighted &&
                "border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-sky-500/10 dark:border-violet-400",
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon
                className={cn(
                  "size-5",
                  item.isHighlighted ? "text-violet-500" : "text-muted-foreground",
                )}
              />
              <p className="font-bold">{item.title}</p>
            </div>
            <p className="mt-2 font-extrabold text-4xl">
              {item.count}
              <span className="ml-1 font-bold text-base">
                {t("枚 / 回", "/ request")}
              </span>
            </p>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
