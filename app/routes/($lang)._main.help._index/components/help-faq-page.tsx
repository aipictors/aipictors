import { useSearchParams } from "@remix-run/react"
import { useMemo, useState } from "react"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  createHelpBreadcrumb,
  createHelpFaqJsonLd,
  HelpBreadcrumbNav,
  HelpContactSection,
  HelpFaqItem,
  HelpLegalLinks,
  HelpSearchInput,
  helpSectionPath,
} from "~/routes/($lang)._main.help._index/components/help-parts"
import { HelpQuickFacts } from "~/routes/($lang)._main.help._index/components/help-quick-facts"
import {
  matchesHelpSearch,
  toHelpSearchTokens,
} from "~/routes/($lang)._main.help._index/components/help-search"
import { HELP_SECTIONS } from "~/routes/($lang)._main.help._index/components/help-sections"

const ALL_FAQS = HELP_SECTIONS.flatMap((section) => section.faqs)

/**
 * よくある質問の一覧（/help/faq）。数字の早見表と、章ごとの質問。検索欄で絞り込む（?q= でも開ける）
 */
export function HelpFaqPage() {
  const t = useTranslation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const tokens = useMemo(() => toHelpSearchTokens(query), [query])

  const groups = HELP_SECTIONS.map((section) => ({
    section,
    faqs: section.faqs.filter((faq) =>
      matchesHelpSearch(tokens, [faq.q.ja, faq.q.en, faq.a.ja, faq.a.en]),
    ),
  })).filter((group) => group.faqs.length > 0)
  const matchedCount = groups.reduce((sum, group) => sum + group.faqs.length, 0)

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8">
      <AppBreadcrumbScript
        breadcrumb={createHelpBreadcrumb(t.isEnglish, [
          { name: t("使い方ガイド", "User Guide"), path: "/help" },
          { name: t("よくある質問", "FAQ"), path: "/help/faq" },
        ])}
      />
      <AppJsonLdScript jsonLd={createHelpFaqJsonLd(t.isEnglish, ALL_FAQS)} />

      <HelpBreadcrumbNav items={[{ label: t("よくある質問", "FAQ") }]} />

      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">
            {t("よくある質問", "Frequently asked questions")}
          </h1>
          <p className="leading-7">
            {t(
              "Discord やチャットサポートで多い質問と答えを、章ごとにまとめました。",
              "Common questions from Discord and chat support, grouped by section.",
            )}
          </p>
        </div>
        <HelpSearchInput
          value={query}
          onChange={setQuery}
          placeholder={t(
            "質問を検索（例: 解約、コイン 期限、R18）",
            "Search questions (e.g. cancel, coins expire, R18)",
          )}
        />
      </header>

      {tokens.length === 0 && (
        <nav
          aria-label={t("章へ移動", "Jump to section")}
          className="flex flex-wrap gap-1.5"
        >
          <a
            href="#numbers"
            className="rounded-full border bg-card px-3 py-1 text-sm hover:bg-muted"
          >
            {t("🔢 数字の早見表", "🔢 Quick reference")}
          </a>
          {groups.map(({ section }) => (
            <a
              key={section.id}
              href={`#faq-${section.id}`}
              className="rounded-full border bg-card px-3 py-1 text-sm hover:bg-muted"
            >
              {section.emoji} {t(section.title.ja, section.title.en)}
            </a>
          ))}
        </nav>
      )}

      {tokens.length === 0 && <HelpQuickFacts />}

      {tokens.length > 0 && (
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {matchedCount > 0
            ? t(`${matchedCount} 件の質問`, `${matchedCount} questions`)
            : t(
                "見つかりませんでした。言葉を短くするか、下の「困ったときは」から聞いてください。",
                "No matches. Try fewer words, or ask us via “Need help?” below.",
              )}
        </p>
      )}

      {groups.map(({ section, faqs }) => (
        <section
          key={section.id}
          id={`faq-${section.id}`}
          aria-labelledby={`faq-${section.id}-title`}
          className="scroll-mt-20 space-y-3"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2
              id={`faq-${section.id}-title`}
              className="flex items-center gap-2 font-bold text-xl"
            >
              <span aria-hidden>{section.emoji}</span>
              {t(section.title.ja, section.title.en)}
            </h2>
            <Link
              to={helpSectionPath(section)}
              className="text-orange-600 text-sm hover:underline dark:text-orange-300"
            >
              {t("章を読む", "Read section")} →
            </Link>
          </div>
          <div className="divide-y rounded-2xl border bg-card">
            {faqs.map((faq) => (
              <HelpFaqItem
                key={faq.q.ja}
                faq={faq}
                isOpen={tokens.length > 0}
              />
            ))}
          </div>
        </section>
      ))}

      <HelpContactSection />

      <HelpLegalLinks />
    </div>
  )
}
