import { Link } from "@remix-run/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { useTranslation } from "~/hooks/use-translation"
import {
  GENERATION_COIN_COST,
  getPlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"

/**
 * プランのよくある質問
 */
export function PlusFaq () {
  const t = useTranslation()
  const free = getPlanSpec("FREE")
  const lite = getPlanSpec("LITE")

  const items = [
    {
      id: "cancel",
      question: t("解約はいつでもできますか？", "Can I cancel anytime?"),
      answer: t(
        "はい、このページからいつでも解約できます。解約後も次回の更新日までは特典をそのまま使えます。更新日以降に料金が請求されることはありません。",
        "Yes. You can cancel anytime from this page and keep your benefits until the next renewal date. You won't be charged after that.",
      ),
    },
    {
      id: "proration",
      question: t(
        "途中でプランを変えると日割りになりますか？",
        "Is a plan change prorated?",
      ),
      answer: t(
        "上位のプランへの変更はすぐに切り替わり、残りの期間分を差し引いた日割りの差額だけを決済します（変更前に金額を確認できます）。解約した場合は、期間の途中でも日割りでの返金はありません。",
        "Upgrades take effect immediately and you only pay the prorated difference (shown before you confirm). Cancellations are not refunded pro rata.",
      ),
    },
    {
      id: "coins",
      question: t("コインはどういう仕組みですか？", "How do coins work?"),
      answer: t(
        `毎日0時（日本時間）にフリーコインが届きます。通常生成は1枚${GENERATION_COIN_COST.standard}コイン、高解像度は1枚${GENERATION_COIN_COST.highResolution}コイン、画像から生成は1枚${GENERATION_COIN_COST.imageToImage}コインです。使い切れなかったフリーコインはその日のうちに失効し、翌日に繰り越されません。足りないときは購入したプレミアムコインが使われます。`,
        `Free coins arrive daily at 0:00 JST. Standard images cost ${GENERATION_COIN_COST.standard} coins, high resolution ${GENERATION_COIN_COST.highResolution}, and image to image ${GENERATION_COIN_COST.imageToImage}. Unused free coins expire daily. Purchased premium coins are used when free coins run out.`,
      ),
    },
    {
      id: "four",
      question: t("「1回で4枚」とはどういうことですか？", "What does \"4 per request\" mean?"),
      answer: t(
        `プランに加入すると、生成ボタンを1回押すだけで${lite.imagesPerRequest}枚まとめて生成されます（無料は${free.imagesPerRequest}枚）。高解像度と画像から生成は、プランに関係なく1回1枚です。`,
        `With a plan, one click generates ${lite.imagesPerRequest} images (${free.imagesPerRequest} on Free). High resolution and image to image always make 1 image per request.`,
      ),
    },
    {
      id: "free",
      question: t("無料でも生成できますか？", "Can I generate for free?"),
      answer: t(
        `はい。無料でも毎日${free.dailyFreeCoins}フリーコイン（通常生成${free.dailyImages}枚分）が届き、みんなのモデルを使って生成できます。`,
        `Yes. Free users get ${free.dailyFreeCoins} free coins daily (${free.dailyImages} images) and can use community models.`,
      ),
    },
    {
      id: "payment",
      question: t("支払い方法は？", "How do I pay?"),
      answer: t(
        "Stripe によるクレジットカード決済です。加入日から1か月ごとに自動で更新されます。",
        "Credit card via Stripe. The plan renews monthly from the day you subscribe.",
      ),
    },
  ]

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-xl md:text-2xl">
        {t("よくある質問", "FAQ")}
      </h2>
      <Accordion type="multiple" className="w-full rounded-2xl border px-4">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="last:border-b-0"
          >
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-muted-foreground text-xs">
        {t("そのほかのご質問は", "For other questions, ")}
        <Link to="/support/chat" className="underline">
          {t("お問い合わせ", "contact us")}
        </Link>
        {t("からどうぞ。", ".")}
      </p>
    </section>
  )
}
