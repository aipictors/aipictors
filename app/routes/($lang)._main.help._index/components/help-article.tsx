import {
  ChevronRightIcon,
  HistoryIcon,
  MessageCircleQuestionIcon,
  TableIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { HELP_RECENT_CHANGES } from "~/routes/($lang)._main.help._index/components/help-guide-meta"
import {
  createHelpBreadcrumb,
  createHelpFaqJsonLd,
  HelpContactSection,
  HelpFaqItem,
  HelpLegalLinks,
  HelpSearchInput,
  helpSectionPath,
} from "~/routes/($lang)._main.help._index/components/help-parts"
import {
  matchesHelpSearch,
  toHelpSearchTokens,
} from "~/routes/($lang)._main.help._index/components/help-search"
import {
  HELP_GROUPS,
  HELP_SECTIONS,
  type HelpSection,
  LEGACY_TAB_TO_SECTION,
  TOP_HELP_FAQS,
} from "~/routes/($lang)._main.help._index/components/help-sections"

/** 検索結果に出す件数の上限（多すぎると探しにくいので、続きは全 FAQ のページで） */
const MAX_FAQ_RESULTS = 12

const sectionSearchTexts = (section: HelpSection) => [
  section.title.ja,
  section.title.en,
  section.summary.ja,
  section.summary.en,
  section.lead.ja,
  section.lead.en,
  ...section.points.flatMap((point) => [point.ja, point.en]),
]

/**
 * 使い方ガイドの入口（/help）。検索・章のカード・よくある質問の上位・最近の変更・困ったとき・規約へのリンク
 * 4 コマの絵は章のページだけで読む（入口は軽くする）
 */
export function HelpArticle() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const tokens = useMemo(() => toHelpSearchTokens(query), [query])

  // 以前の 1 ページ版の見出しへのリンク（/help#coins など）は章のページへ
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1))
    const id = hash ? LEGACY_TAB_TO_SECTION[hash] : undefined
    if (!id) return
    navigate(id === "faq" ? "/help/faq" : `/help/${id}`, { replace: true })
  }, [navigate])

  const matchedSections = tokens.length
    ? HELP_SECTIONS.filter((section) =>
        matchesHelpSearch(tokens, sectionSearchTexts(section)),
      )
    : []
  const matchedFaqs = tokens.length
    ? HELP_SECTIONS.flatMap((section) =>
        section.faqs.map((faq) => ({ faq, section })),
      ).filter(({ faq }) =>
        matchesHelpSearch(tokens, [faq.q.ja, faq.q.en, faq.a.ja, faq.a.en]),
      )
    : []

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8">
      <AppBreadcrumbScript
        breadcrumb={createHelpBreadcrumb(t.isEnglish, [
          { name: t("使い方ガイド", "User Guide"), path: "/help" },
        ])}
      />
      <AppJsonLdScript
        jsonLd={createHelpFaqJsonLd(t.isEnglish, TOP_HELP_FAQS)}
      />

      {/* 見出しと検索 */}
      <header className="space-y-4 rounded-3xl bg-linear-to-br from-orange-100 via-pink-100 to-sky-100 p-5 sm:p-8 dark:from-orange-950 dark:via-pink-950 dark:to-sky-950">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl leading-tight sm:text-4xl">
            {t("Aipictors 使い方ガイド", "Aipictors User Guide")}
          </h1>
          <p className="text-base leading-7">
            {t(
              "投稿・AI 画像生成・コインと推し・クリエイター報酬・有料リクエスト・プランまで。章ごとにぴくたーちゃんの 4 コマで解説しています。",
              "Posting, AI image generation, coins and support, creator rewards, paid requests and plans — each section explained with a Pictor-chan comic.",
            )}
          </p>
        </div>
        <HelpSearchInput value={query} onChange={setQuery} />
      </header>

      {tokens.length > 0 ? (
        <section aria-live="polite" className="space-y-4">
          <h2 className="font-bold text-xl">
            {t(
              `「${query.trim()}」の検索結果`,
              `Results for “${query.trim()}”`,
            )}
          </h2>
          {matchedSections.length === 0 && matchedFaqs.length === 0 && (
            <p className="rounded-2xl border bg-card p-4 text-sm leading-6">
              {t(
                "見つかりませんでした。言葉を短くするか、下の「困ったときは」から聞いてください。",
                "No matches. Try fewer words, or ask us via “Need help?” below.",
              )}
            </p>
          )}
          {matchedSections.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {matchedSections.map((section) => (
                <li key={section.id}>
                  <HelpSectionCard section={section} />
                </li>
              ))}
            </ul>
          )}
          {matchedFaqs.length > 0 && (
            <div className="divide-y rounded-2xl border bg-card">
              {matchedFaqs.slice(0, MAX_FAQ_RESULTS).map(({ faq, section }) => (
                <HelpFaqItem key={faq.q.ja} faq={faq} section={section} />
              ))}
            </div>
          )}
          {matchedFaqs.length > MAX_FAQ_RESULTS && (
            <Link
              to={`/help/faq?q=${encodeURIComponent(query.trim())}`}
              className="inline-block text-orange-600 text-sm hover:underline dark:text-orange-300"
            >
              {t(
                `ほかに ${matchedFaqs.length - MAX_FAQ_RESULTS} 件の質問`,
                `${matchedFaqs.length - MAX_FAQ_RESULTS} more questions`,
              )}{" "}
              →
            </Link>
          )}
        </section>
      ) : (
        <>
          {/* 章のカード */}
          <nav aria-label={t("目次", "Contents")} className="space-y-5">
            {HELP_GROUPS.map((group) => (
              <section key={group.id} className="space-y-2">
                <h2 className="font-semibold text-muted-foreground text-sm">
                  {t(group.label.ja, group.label.en)}
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {HELP_SECTIONS.filter(
                    (section) => section.group === group.id,
                  ).map((section) => (
                    <li key={section.id}>
                      <HelpSectionCard section={section} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          {/* よくある質問の上位 */}
          <section aria-labelledby="help-top-faq" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2
                id="help-top-faq"
                className="flex items-center gap-2 font-bold text-2xl"
              >
                <MessageCircleQuestionIcon
                  aria-hidden
                  className="size-6 text-orange-500"
                />
                {t("よくある質問", "Top questions")}
              </h2>
              <Link
                to="/help/faq"
                className="text-orange-600 text-sm hover:underline dark:text-orange-300"
              >
                {t("すべての質問を見る", "All questions")} →
              </Link>
            </div>
            <div className="divide-y rounded-2xl border bg-card">
              {TOP_HELP_FAQS.map((faq) => (
                <HelpFaqItem key={faq.q.ja} faq={faq} section={faq.section} />
              ))}
            </div>
          </section>

          <div className="grid items-start gap-4 md:grid-cols-2">
            {/* 数字の早見表への入口 */}
            <Link
              to="/help/faq#numbers"
              className="flex items-start gap-3 rounded-2xl border bg-card p-4 hover:bg-muted"
            >
              <TableIcon
                aria-hidden
                className="mt-0.5 size-6 shrink-0 text-orange-500"
              />
              <span className="space-y-1">
                <span className="block font-bold">
                  {t("数字の早見表", "Quick reference")}
                </span>
                <span className="block text-muted-foreground text-sm leading-6">
                  {t(
                    "プランごとの違い、コインの期限と使われる順、生成のコイン、シリーズ・動画の上限、生成画像の保存期間",
                    "Plan differences, coin expiry and order, generation costs, series and video limits, image retention",
                  )}
                </span>
              </span>
            </Link>

            {/* 最近変わったこと */}
            <section
              aria-labelledby="help-recent"
              className="space-y-2 rounded-2xl border bg-card p-4"
            >
              <h2
                id="help-recent"
                className="flex items-center gap-2 font-bold"
              >
                <HistoryIcon aria-hidden className="size-5 text-orange-500" />
                {t("最近変わったこと", "Recent changes")}
              </h2>
              <ul className="space-y-1.5 text-sm leading-6">
                {HELP_RECENT_CHANGES.map((change) => (
                  <li key={change.text.ja} className="flex gap-2">
                    <time
                      dateTime={change.date}
                      className="shrink-0 text-muted-foreground tabular-nums"
                    >
                      {change.date.slice(5).replace("-", "/")}
                    </time>
                    {change.to ? (
                      <Link to={change.to} className="hover:underline">
                        {t(change.text.ja, change.text.en)}
                      </Link>
                    ) : (
                      <span>{t(change.text.ja, change.text.en)}</span>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                to="/releases"
                className="inline-block text-orange-600 text-sm hover:underline dark:text-orange-300"
              >
                {t("お知らせ一覧", "All announcements")} →
              </Link>
            </section>
          </div>
        </>
      )}

      <HelpContactSection />

      <HelpLegalLinks />

      <p className="text-center text-muted-foreground text-sm">
        <Link to="/guides" className="underline">
          {t("AI イラストの作り方ガイド", "AI art how-to guides")}
        </Link>
        {" ・ "}
        <Link to="/help/withdrawal" className="underline">
          {t("退会（アカウントの削除）について", "Deleting your account")}
        </Link>
      </p>
    </div>
  )
}

function HelpSectionCard(props: { section: HelpSection }) {
  const t = useTranslation()
  const { section } = props
  return (
    <Link
      to={helpSectionPath(section)}
      className="flex h-full items-center gap-3 rounded-2xl border bg-card p-3 hover:bg-muted"
    >
      <span aria-hidden className="text-2xl">
        {section.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5 font-semibold">
          {t(section.title.ja, section.title.en)}
          {section.isNew && (
            <span className="rounded bg-pink-500 px-1 font-bold text-[10px] text-white leading-4">
              NEW
            </span>
          )}
        </span>
        <span className="block text-muted-foreground text-xs leading-5">
          {t(section.summary.ja, section.summary.en)}
        </span>
      </span>
      <ChevronRightIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  )
}
