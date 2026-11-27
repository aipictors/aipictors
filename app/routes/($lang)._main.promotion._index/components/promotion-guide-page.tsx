import {
  CalendarClockIcon,
  CoinsIcon,
  CrownIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  TagIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "~/components/ui/button"
import {
  PromotionWorkCard,
  WorkPromotionBanner,
  WorkPromotionMark,
} from "~/components/work/work-promotion"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

/**
 * 宣伝枠のご案内。何が・どこに・どう出るかを見本で見せ、出し方（プラン / プレミアムコイン）とルールをまとめる。
 * 値段・日数・枠の数は aipictors-system の lib/work-promotion-purchase.ts と同じ
 */
export function PromotionGuidePage() {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <header className="space-y-3">
        <p className="flex items-center gap-2 font-bold text-pink-600 text-sm dark:text-pink-400">
          <MegaphoneIcon className="size-4" />
          {t("宣伝枠", "Promotions")}
        </p>
        <h1 className="font-bold text-2xl md:text-3xl">
          {t(
            "あなたの作品を、ホームの一番目立つ場所に",
            "Feature your work at the top of the home page",
          )}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {t(
            "宣伝枠に出した作品は7日間、トップの「おすすめ作品」の一覧の先頭に、PR の印付きで表示されます。作品集や自分のサービス、依頼の受付などを、より多くの人に見てもらえます。",
            "Promoted works are shown first in Recommended works on the home page, with a PR mark, for 7 days. Use it to show your portfolio, your service, or that you're open for requests.",
          )}
        </p>
      </header>

      <section className="space-y-4">
        <SectionTitle icon={<LayoutGridIcon className="size-5" />}>
          {t("こんなふうに表示されます", "How it looks")}
        </SectionTitle>
        <div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
          <p className="font-bold">{t("おすすめ作品", "Recommended works")}</p>
          <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
            {t(
              "トップのお知らせのすぐ下（見本）。宣伝の作品は先頭に",
              "Right below the announcements on the home page (example). Promoted works come first with",
            )}
            <WorkPromotionMark />
            {t("の印付きで並びます", "")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <PromotionWorkCard
              title={t("あなたの作品のタイトル", "Your work's title")}
              userName={t("あなた", "You")}
              relatedUrl="https://example.com"
            />
            {/* 宣伝の後ろには、宣伝ではないおすすめ作品が PR の印なしで並ぶ */}
            <ExamplePickCard />
            <ExamplePickCard className="hidden sm:block" />
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          <Point icon={<CalendarClockIcon className="size-4" />}>
            {t(
              "7日間、トップの「おすすめ作品」の一覧の先頭に、PR の印付きで表示されます（PC では 1 件を大きく表示。宣伝が複数のときは読み込みごとに交代）",
              "Shown first in Recommended works, with a PR mark, for 7 days (on PC one is shown large, rotating on each visit when there are several)",
            )}
          </Point>
          <Point icon={<ExternalLinkIcon className="size-4" />}>
            {t(
              "作品の「関連リンク」に入れたページへのボタンが付きます（作品集・ショップ・依頼の受付など）",
              "Gets a button to the page in your work's related link (portfolio, shop, commissions…)",
            )}
          </Point>
          <Point icon={<TagIcon className="size-4" />}>
            {t(
              "作品ページに宣伝の帯が出て、一覧のサムネイルに PR のしるしが付きます",
              "Your work page gets a promotion banner and thumbnails get a PR mark",
            )}
          </Point>
        </ul>
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs">
            {t("作品ページの帯（見本）", "Banner on your work page (example)")}
          </p>
          <WorkPromotionBanner
            userName={t("あなた", "You")}
            relatedUrl="https://example.com"
            isPreview
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle icon={<MegaphoneIcon className="size-5" />}>
          {t("出し方は2つ", "Two ways to promote")}
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <WayCard
            icon={<CrownIcon className="size-5 text-amber-500" />}
            title={t("プランの特典で（週1作品）", "With a plan (1 a week)")}
            badge={t("スタンダード・プレミアム", "Standard / Premium")}
            steps={[
              t(
                "投稿画面の下の方にある「宣伝作品」で「宣伝作品に設定する」にチェック",
                "Check “Set as Advertising Work” in the post form",
              ),
              t(
                "公開した時から7日間表示されます",
                "Shown for 7 days from publishing",
              ),
            ]}
            action={
              <Button asChild variant="secondary" className="w-full">
                <Link to="/plus">{t("プランを見る", "See plans")}</Link>
              </Button>
            }
          />
          <WayCard
            icon={<CoinsIcon className="size-5 text-pink-500" />}
            title={t(
              "プレミアムコインで（いつでも）",
              "With premium coins (anytime)",
            )}
            badge={t("プランなしでもOK", "No plan needed")}
            steps={[
              t(
                "公開中の自分の作品のページで「宣伝する」を押す",
                "Press “Promote” on your published work's page",
              ),
              t(
                "プレミアムコイン500枚で、押した時から7日間表示されます",
                "500 premium coins for 7 days from then",
              ),
            ]}
            action={
              <Button asChild variant="secondary" className="w-full">
                <Link to="/settings/points">
                  {t("コインの残高を見る", "Check your coins")}
                </Link>
              </Button>
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={<TagIcon className="size-5" />}>
          {t("ルール", "Rules")}
        </SectionTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>
            {t(
              "宣伝できるのは、ひとりにつき全年齢（全年齢・R15）と R18（R18・R18G）でそれぞれ1作品ずつです。7日たつと次の作品に入れ替えられます",
              "One work each for all-ages (G/R15) and R18 (R18/R18G) at a time. You can switch to another after 7 days",
            )}
          </li>
          <li>
            {t(
              "全年齢の作品は通常のホームに、R18 の作品は R18 のホームに出ます",
              "All-ages works appear on the regular home page, R18 works on the R18 home page",
            )}
          </li>
          <li>
            {t(
              "一度出すと取り消せません。コインで出した場合もコインは戻りません",
              "Once started, a promotion can't be canceled, and coins aren't refunded",
            )}
          </li>
          <li>
            {t(
              "コインで出すときはプレミアムコインだけが使えます（無料コインは使えません）",
              "Only premium coins can be used (not free coins)",
            )}
          </li>
          <li>
            {t(
              "宣伝枠以外（作品の説明やコメントなど）での宣伝は規約違反です",
              "Promoting outside this slot (in captions, comments, etc.) is against the terms",
            )}
          </li>
        </ul>
        <p className="text-muted-foreground text-xs">
          {t(
            "分からないことは、サポートや Discord のお問い合わせでお気軽にどうぞ。",
            "Questions? Ask support or on our Discord.",
          )}
        </p>
      </section>
    </div>
  )
}

function SectionTitle(props: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-bold text-lg">
      <span className="text-pink-500">{props.icon}</span>
      {props.children}
    </h2>
  )
}

function Point(props: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-pink-500">{props.icon}</span>
      <span>{props.children}</span>
    </li>
  )
}

function WayCard(props: {
  icon: ReactNode
  title: string
  badge: string
  steps: string[]
  action: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4">
      <div className="space-y-1">
        <p className="flex items-center gap-2 font-bold">
          {props.icon}
          {props.title}
        </p>
        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {props.badge}
        </span>
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed">
        {props.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="mt-auto">{props.action}</div>
    </div>
  )
}

/**
 * 見本の「おすすめ作品」で、宣伝の後ろに並ぶ宣伝ではない作品（PR の印なし）
 */
function ExamplePickCard(props: { className?: string }) {
  const t = useTranslation()
  return (
    <div className={props.className}>
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted p-2 text-center text-muted-foreground text-xs">
        {t("ほかのおすすめ作品（PR なし）", "Other recommended works (no PR)")}
      </div>
    </div>
  )
}
