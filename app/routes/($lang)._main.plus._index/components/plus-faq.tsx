import { Link } from "~/lib/app/locale-router"
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
import { toApproxUsdText, USD_PER_JPY } from "~/utils/to-approx-usd-text"

/**
 * プランのよくある質問
 */
export function PlusFaq () {
  const t = useTranslation()
  const free = getPlanSpec("FREE")
  const lite = getPlanSpec("LITE")

  const trialItem = {
    id: "trial",
    question: t(
      "7日間の無料お試しはどういう仕組みですか？",
      "How does the 7-day free trial work?",
    ),
    answer: t(
      "これまで一度も有料プランに入ったことがない方は、ライト（月払い）を7日間無料で試せます（お1人1回）。申込みにはカードの登録が必要です。7日間は料金がかからず、8日目から ¥480/月（税込）で自動更新されます。お試し中にこのページから解約すれば料金はかからず、お試しの終わりまではそのまま使えます。終了の3日前にメールでお知らせします。同じカードでのお試しは1回だけで、2回目は申込みが取り消され、料金は発生しません。以前プランに入っていた方と、スタンダード・プレミアムの月払いは初月半額です。",
      `If you've never had a paid plan, you can try Lite (monthly) free for 7 days, once per person. You'll need to enter a card to start. Nothing is charged for 7 days; from day 8 it renews automatically at ¥480/mo (${toApproxUsdText(480)}, tax included, charged in JPY). Cancel from this page during the trial and you won't be charged — you keep access until the trial ends. We email you 3 days before it ends. A card can only be used for one trial; a second attempt is cancelled and nothing is charged. If you've had a plan before, or choose Standard or Premium, you get 50% off the first month instead.`,
    ),
  }

  const items = [
    trialItem,
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
        "What happens if I switch plans?",
      ),
      answer: t(
        "上位のプランへの変更はすぐに切り替わり、残りの期間分を差し引いた日割りの差額だけを決済します（変更前に金額を確認できます）。解約した場合は、期間の途中でも日割りでの返金はありません。",
        "Upgrades take effect right away, and you only pay the prorated difference for the rest of your current period — we show you the amount before you confirm. If you cancel, the remaining days aren't refunded, but you keep your benefits until the period ends.",
      ),
    },
    {
      id: "yearly",
      question: t("年払いはありますか？", "Is there a yearly plan?"),
      answer: t(
        "はい。月額の10か月分の料金で1年使えます（2か月分おトク）。毎日のフリーコインなどの特典は月払いと同じです。初月半額は月払いだけが対象です。解約すると次の更新日（1年後）まで使え、途中での日割りの返金はありません。",
        "Yes. Yearly plans cost 10 months' worth for a full year, so you get 2 months free. The benefits are identical to monthly. The first-month discount is for monthly plans only, and yearly plans aren't refunded for unused time.",
      ),
    },
    {
      id: "paypay",
      question: t("PayPayで払えますか？", "Can I pay with PayPay?"),
      answer: t(
        "自動更新なしの1か月・1年のパスとプレミアムコインは、PayPayで購入できるようにしています（現在、決済会社の審査中で、審査が終わりしだい決済画面にPayPayが出ます）。自動更新の月払い・年払いはクレジットカードのみです。パスは期限が来ると自動で終わり、期限の前にもう一度買うと期限が延びます。",
        "Yes. Non-renewing 1-month/1-year passes and premium coins can be paid with PayPay. Auto-renewing plans require a card.",
      ),
    },
    {
      id: "konbini",
      question: t("コンビニで払えますか？", "Can I pay at a convenience store?"),
      answer: t(
        "自動更新なしの1か月・1年のパスとプレミアムコインは、コンビニ払いで購入できるようにしています（現在、決済会社の審査中で、審査が終わりしだい決済画面にコンビニ払いが出ます）。決済画面とメールでお知らせするお支払い番号で、3日以内にコンビニでお支払いください。お支払いが確認されると、プランやコインが使えるようになります。",
        "Non-renewing passes and premium coins can be paid at convenience stores in Japan (pending approval). Pay within 3 days using the number shown at checkout; your plan or coins are added once payment is confirmed.",
      ),
    },
    {
      id: "pause",
      question: t("使わない月だけ止められますか？", "Can I pause for a month?"),
      answer: t(
        "はい。月払いの方は、解約の画面から「1か月休止」を選べます。今の期間の終わりから1か月、請求もプランも止まり、1か月後に自動で再開します。休止の予約はこのページから取り消せます。",
        "Yes. If you're on a monthly plan, you can pause for one month instead of cancelling. Billing and benefits stop for a month after your current period, then pick up again automatically. You can undo the pause from this page.",
      ),
    },
    {
      id: "coins",
      question: t("コインはどういう仕組みですか？", "How do coins work?"),
      answer: t(
        `毎日0時（日本時間）にフリーコインが届きます。通常生成は1枚${GENERATION_COIN_COST.standard}コイン、高解像度は1枚${GENERATION_COIN_COST.highResolution}コイン、画像から生成は1枚${GENERATION_COIN_COST.imageToImage}コインです。使い切れなかったフリーコインはその日のうちに失効し、翌日に繰り越されません。足りないときは購入したプレミアムコインが使われます。`,
        `You get free coins every day at midnight Japan time (JST). A standard image costs ${GENERATION_COIN_COST.standard} coins, high resolution ${GENERATION_COIN_COST.highResolution}, and image-to-image ${GENERATION_COIN_COST.imageToImage}. Free coins don't roll over to the next day. If you run out, any premium coins you've bought are used instead.`,
      ),
    },
    {
      id: "four",
      question: t("「1回で4枚」とはどういうことですか？", "What does \"4 images per click\" mean?"),
      answer: t(
        `プランに加入すると、生成ボタンを1回押すだけで${lite.imagesPerRequest}枚まとめて生成されます（無料は${free.imagesPerRequest}枚）。高解像度と画像から生成は、プランに関係なく1回1枚です。`,
        `On a plan, pressing Generate once makes ${lite.imagesPerRequest} images from your prompt, so you can pick the best one (Free makes ${free.imagesPerRequest}). High resolution and image-to-image always make 1 image per click.`,
      ),
    },
    {
      id: "free",
      question: t("無料でも生成できますか？", "Can I generate for free?"),
      answer: t(
        `はい。無料でも毎日${free.dailyFreeCoins}フリーコイン（通常生成${free.dailyImages}枚分）が届き、みんなのモデルを使って生成できます。`,
        `Yes. Without paying anything you get ${free.dailyFreeCoins} coins every day — enough for ${free.dailyImages} images — and can use the community models. No card needed.`,
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
    {
      id: "card-update",
      question: t("クレジットカードを変更・更新するには？", "How do I change my card?"),
      answer: t(
        "このページの「ご利用中のプラン」にある「お支払いカードを変更する」から、Stripe の画面で新しいカードを登録できます。次回の請求から新しいカードが使われます。",
        "Once you're subscribed, this page shows a button to change your payment card. It opens Stripe, where you can add a new card; it's used from your next payment.",
      ),
    },
  ]

  // 英語の表示では、海外の人が最初に知りたいこと（海外のカード・請求の通貨・解約・英語で使えるか・R18）を上に置き、
  // 日本だけの支払い方法（PayPay・コンビニ払い）は出さない
  const englishItems = [
    {
      id: "international",
      question: "Can I pay with a card issued outside Japan?",
      answer:
        "Yes. Payment is handled by Stripe, and cards issued outside Japan are already used here. Stripe's checkout page normally follows your browser's language.",
    },
    {
      id: "currency",
      question: "What currency am I charged in?",
      answer: `Japanese yen (JPY), tax included. The dollar amounts on this page are estimates at roughly ¥${Math.round(1 / USD_PER_JPY)} to US$1. Your card issuer converts the charge at its own rate and may add a foreign transaction fee, so the amount on your statement can differ slightly.`,
    },
    trialItem,
    {
      id: "cancel",
      question: "Can I cancel anytime?",
      answer:
        "Yes. You can cancel from this page whenever you like. You keep your benefits until the end of the period you've paid for, and you won't be charged again.",
    },
    {
      id: "english",
      question: "Can I use the generator in English?",
      answer:
        "Yes. The generator and this plans page are in English, and you can write your prompts in English. Some parts of the site — a few account screens and text written by other users — are still in Japanese.",
    },
    {
      id: "r18",
      question: "How is R18 content handled?",
      answer:
        "R18 works are kept in a separate R18 section behind an age confirmation, and you switch between All ages and R18 with the toggle in the header. Plans work the same in both — there is no separate R18 plan or extra charge.",
    },
    {
      id: "first-month",
      question: "Who gets the first month at half price?",
      answer:
        "Anyone who isn't currently on a plan, when choosing a monthly plan — including returning members. (If you're eligible for the free trial, Lite starts with the trial instead.) The discount is applied automatically at checkout. From the second month you pay the regular price. Yearly plans and non-renewing passes aren't discounted.",
    },
    ...items.filter(
      (item) =>
        !["trial", "cancel", "paypay", "konbini", "payment"].includes(item.id),
    ),
  ]

  const visibleItems = t.isEnglish ? englishItems : items

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-xl md:text-2xl">
        {t("よくある質問", "Questions, answered")}
      </h2>
      <Accordion type="multiple" className="w-full rounded-2xl border px-4">
        {visibleItems.map((item) => (
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
        {t("そのほかのご質問は", "Still have a question? ")}
        <Link to="/support/chat" className="underline">
          {t("お問い合わせ", "Contact us")}
        </Link>
        {t("からどうぞ。", ".")}
      </p>
    </section>
  )
}
