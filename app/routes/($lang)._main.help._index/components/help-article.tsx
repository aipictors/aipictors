import { useSearchParams } from "@remix-run/react"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  MessageCircleQuestionIcon,
  SparklesIcon,
} from "lucide-react"
import { useEffect } from "react"
import type { BreadcrumbList, FAQPage, WithContext } from "schema-dts"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { CoinHelpContent } from "~/components/coin-help-content"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  HelpFourKoma,
  helpMangaImageUrl,
} from "~/routes/($lang)._main.help._index/components/help-four-koma"
import {
  HELP_GROUPS,
  HELP_SECTIONS,
  type HelpSection,
  LEGACY_TAB_TO_SECTION,
} from "~/routes/($lang)._main.help._index/components/help-sections"

const SITE_URL = "https://www.aipictors.com"

const DISCORD_URL = "https://discord.gg/7jA2MmtvtR"

/**
 * 使い方ガイド。章ごとにぴくたーちゃんの 4 コマ・ポイント・リンク・よくある質問を 1 ページに並べる
 * （タブで隠すと検索エンジンに読まれないので、全部の章を描いて目次から飛ぶ）
 */
export function HelpArticle() {
  const t = useTranslation()
  const [searchParams] = useSearchParams()
  const legacyTab = searchParams.get("tab")

  // 以前のタブの URL（/help?tab=coins など）は該当の章へ
  useEffect(() => {
    const id = legacyTab ? LEGACY_TAB_TO_SECTION[legacyTab] : undefined
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ block: "start" })
  }, [legacyTab])

  const pageUrl = `${SITE_URL}${t.isEnglish ? "/en" : ""}/help`
  const faqs = HELP_SECTIONS.flatMap((section) => section.faqs)
  const newSections = HELP_SECTIONS.filter((section) => section.isNew)

  const faqJsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: t.isEnglish ? "en" : "ja",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: t(faq.q.ja, faq.q.en),
      acceptedAnswer: { "@type": "Answer", text: t(faq.a.ja, faq.a.en) },
    })),
  }

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${SITE_URL}${t.isEnglish ? "/en" : "/"}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("使い方ガイド", "User Guide"),
        item: pageUrl,
      },
    ],
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-10 px-3 py-6 sm:px-6 sm:py-8">
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={faqJsonLd} />

      {/* ヒーロー */}
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-orange-100 via-pink-100 to-sky-100 p-5 sm:p-8 dark:from-orange-950 dark:via-pink-950 dark:to-sky-950">
        <div className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <p className="font-medium text-orange-600 text-sm dark:text-orange-300">
              {t(
                "ぴくたーちゃんの4コマでわかる",
                "Explained with Pictor-chan comics",
              )}
            </p>
            <h1 className="font-bold text-3xl leading-tight sm:text-4xl">
              {t("Aipictors 使い方ガイド", "Aipictors User Guide")}
            </h1>
            <p className="text-base leading-7 sm:text-lg">
              {t(
                "作品の見方・投稿・AI 画像生成から、コインでの推し、クリエイター報酬（換金）、有料リクエスト、宣伝枠まで。Aipictors のすべての機能を、公式キャラクターぴくたーちゃんの 4 コマ漫画でやさしく解説します。",
                "From browsing, posting and AI image generation to coin support, creator rewards (cash out), paid requests and promotion slots — every Aipictors feature, explained with 4-panel comics starring our mascot Pictor-chan.",
              )}
            </p>
            {newSections.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 font-bold text-pink-600 text-sm dark:text-pink-300">
                  <SparklesIcon className="size-4" />
                  {t("新機能", "New")}
                </span>
                {newSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full bg-white/80 px-3 py-1 font-medium text-sm shadow-sm hover:bg-white dark:bg-slate-900/70"
                  >
                    {section.emoji} {t(section.title.ja, section.title.en)}
                  </a>
                ))}
              </div>
            )}
          </div>
          <img
            src={helpMangaImageUrl("hero")}
            alt={t(
              "本を持って手をふるぴくたーちゃん",
              "Pictor-chan waving with a guidebook",
            )}
            width={960}
            height={656}
            fetchPriority="high"
            className="w-full rounded-2xl shadow-md"
          />
        </div>
      </header>

      {/* 目次 */}
      <nav
        aria-label={t("目次", "Contents")}
        className="space-y-3 rounded-2xl border bg-card p-4"
      >
        <h2 className="font-bold text-lg">{t("目次", "Contents")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_GROUPS.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <p className="font-semibold text-muted-foreground text-xs">
                {t(group.label.ja, group.label.en)}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {HELP_SECTIONS.filter(
                  (section) => section.group === group.id,
                ).map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                    >
                      <span aria-hidden>{section.emoji}</span>
                      {t(section.title.ja, section.title.en)}
                      {section.isNew && (
                        <span className="rounded bg-pink-500 px-1 font-bold text-[10px] text-white leading-4">
                          NEW
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {HELP_SECTIONS.map((section, index) => (
        <HelpSectionView
          key={section.id}
          section={section}
          isEager={index === 0}
        />
      ))}

      {/* よくある質問 */}
      <section id="faq" className="scroll-mt-20 space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <MessageCircleQuestionIcon className="size-6 text-orange-500" />
          {t("よくある質問", "FAQ")}
        </h2>
        <div className="divide-y rounded-2xl border bg-card">
          {faqs.map((faq) => (
            <details key={faq.q.ja} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                <h3>{t(faq.q.ja, faq.q.en)}</h3>
                <ChevronDownIcon className="size-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {t(faq.a.ja, faq.a.en)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 困ったとき */}
      <section className="space-y-3 rounded-3xl bg-linear-to-r from-sky-100 to-violet-100 p-6 text-center dark:from-sky-950 dark:to-violet-950">
        <h2 className="font-bold text-xl">
          {t("わからないときは", "Still have questions?")}
        </h2>
        <p className="text-sm leading-6">
          {t(
            "Discord ではぴくたーちゃんと運営が質問や要望に答えています。お問い合わせフォームからも連絡できます。",
            "Pictor-chan and our team answer questions and requests on Discord. You can also reach us through the contact form.",
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              {t("Discord に参加", "Join Discord")}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/contact">{t("お問い合わせ", "Contact us")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides">
              {t("AI イラストの作り方", "AI art guides")}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function HelpSectionView(props: { section: HelpSection; isEager: boolean }) {
  const t = useTranslation()
  const { section } = props

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-20 space-y-5"
    >
      <div className="space-y-2">
        <h2
          id={`${section.id}-title`}
          className="flex flex-wrap items-center gap-2 font-bold text-2xl"
        >
          <span aria-hidden>{section.emoji}</span>
          {t(section.title.ja, section.title.en)}
          {section.isNew && (
            <span className="rounded-full bg-pink-500 px-2 py-0.5 font-bold text-white text-xs">
              NEW
            </span>
          )}
        </h2>
        <p className="leading-7">{t(section.lead.ja, section.lead.en)}</p>
      </div>

      <HelpFourKoma
        title={section.mangaTitle}
        panels={section.panels}
        isEager={props.isEager}
      />

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <h3 className="font-semibold">{t("ポイント", "Key points")}</h3>
          <ul className="space-y-2 text-sm leading-6">
            {section.points.map((point) => (
              <li key={point.ja} className="flex gap-2">
                <span aria-hidden className="text-orange-500">
                  ●
                </span>
                <span>{t(point.ja, point.en)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <h3 className="font-semibold">{t("ここから使う", "Go to")}</h3>
          <ul className="space-y-1.5">
            {section.links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {t(link.label.ja, link.label.en)}
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {section.id === "coins" && (
        <details className="group rounded-2xl border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            {t(
              "コイン・pt・推しをもっと詳しく",
              "More about coins, pt & support",
            )}
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4">
            <CoinHelpContent compact />
          </div>
        </details>
      )}
    </section>
  )
}
