import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  MessageCircleQuestionIcon,
} from "lucide-react"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { CoinHelpContent } from "~/components/coin-help-content"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { HelpFourKoma } from "~/routes/($lang)._main.help._index/components/help-four-koma"
import {
  createHelpBreadcrumb,
  createHelpFaqJsonLd,
  HelpBreadcrumbNav,
  HelpContactSection,
  HelpFaqItem,
  helpSectionPath,
} from "~/routes/($lang)._main.help._index/components/help-parts"
import {
  getAdjacentHelpSections,
  type HelpSection,
} from "~/routes/($lang)._main.help._index/components/help-sections"

/**
 * 使い方ガイドの章のページ（/help/coins など）。4 コマ・ポイント・ここから使う・その章のよくある質問・前後の章
 */
export function HelpSectionPage(props: { section: HelpSection }) {
  const t = useTranslation()
  const { section } = props
  const { prev, next } = getAdjacentHelpSections(section.id)
  const title = t(section.title.ja, section.title.en)

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8">
      <AppBreadcrumbScript
        breadcrumb={createHelpBreadcrumb(t.isEnglish, [
          { name: t("使い方ガイド", "User Guide"), path: "/help" },
          { name: title, path: helpSectionPath(section) },
        ])}
      />
      {section.faqs.length > 0 && (
        <AppJsonLdScript
          jsonLd={createHelpFaqJsonLd(t.isEnglish, section.faqs)}
        />
      )}

      <HelpBreadcrumbNav items={[{ label: title }]} />

      <article aria-labelledby="help-section-title" className="space-y-6">
        <header className="space-y-2">
          <h1
            id="help-section-title"
            className="flex flex-wrap items-center gap-2 font-bold text-2xl sm:text-3xl"
          >
            <span aria-hidden>{section.emoji}</span>
            {title}
            {section.isNew && (
              <span className="rounded-full bg-pink-500 px-2 py-0.5 font-bold text-white text-xs">
                NEW
              </span>
            )}
          </h1>
          <p className="leading-7">{t(section.lead.ja, section.lead.en)}</p>
        </header>

        <HelpFourKoma
          title={section.mangaTitle}
          panels={section.panels}
          isEager
        />

        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <section className="space-y-2 rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">{t("ポイント", "Key points")}</h2>
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
          </section>
          <nav
            aria-labelledby="help-section-links"
            className="space-y-2 rounded-2xl border bg-card p-4"
          >
            <h2 id="help-section-links" className="font-semibold">
              {t("ここから使う", "Go to")}
            </h2>
            <ul className="space-y-1.5">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    {t(link.label.ja, link.label.en)}
                    <ArrowRightIcon
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {section.id === "coins" && (
          <details className="group rounded-2xl border bg-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {t(
                "コイン・pt・推しをもっと詳しく",
                "More about coins, pt & support",
              )}
              <ChevronDownIcon
                aria-hidden
                className="size-4 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-4">
              <CoinHelpContent compact />
            </div>
          </details>
        )}

        {section.faqs.length > 0 && (
          <section aria-labelledby="help-section-faq" className="space-y-3">
            <h2
              id="help-section-faq"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <MessageCircleQuestionIcon
                aria-hidden
                className="size-5 text-orange-500"
              />
              {t("よくある質問", "FAQ")}
            </h2>
            <div className="divide-y rounded-2xl border bg-card">
              {section.faqs.map((faq) => (
                <HelpFaqItem key={faq.q.ja} faq={faq} />
              ))}
            </div>
            <Link
              to="/help/faq"
              className="inline-block text-orange-600 text-sm hover:underline dark:text-orange-300"
            >
              {t("ほかの質問も見る", "See all questions")} →
            </Link>
          </section>
        )}
      </article>

      {/* 前後の章 */}
      <nav
        aria-label={t("前後の章", "Previous and next sections")}
        className="grid gap-3 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            to={helpSectionPath(prev)}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:bg-muted"
          >
            <ArrowLeftIcon aria-hidden className="size-5 shrink-0" />
            <span className="min-w-0">
              <span className="block text-muted-foreground text-xs">
                {t("前の章", "Previous")}
              </span>
              <span className="block truncate font-semibold">
                {prev.emoji} {t(prev.title.ja, prev.title.en)}
              </span>
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link
            to={helpSectionPath(next)}
            className="flex items-center justify-end gap-3 rounded-2xl border bg-card p-4 text-right hover:bg-muted"
          >
            <span className="min-w-0">
              <span className="block text-muted-foreground text-xs">
                {t("次の章", "Next")}
              </span>
              <span className="block truncate font-semibold">
                {next.emoji} {t(next.title.ja, next.title.en)}
              </span>
            </span>
            <ArrowRightIcon aria-hidden className="size-5 shrink-0" />
          </Link>
        )}
      </nav>

      <div className="flex justify-center">
        <Link
          to="/help"
          className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
        >
          {t("使い方ガイドの目次へ", "Back to the guide")}
        </Link>
      </div>

      <HelpContactSection />
    </div>
  )
}
