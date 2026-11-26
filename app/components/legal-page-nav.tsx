import { useLocation } from "@remix-run/react"
import { ChevronRightIcon, ListChecksIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { LEGAL_PAGES } from "~/lib/legal-pages"
import { parseLocalePath } from "~/utils/locale-path"

/**
 * 規約・ポリシーのページの冒頭に出す「このページの要点」（本文の言い換え。正文は本文）
 */
export function LegalPageSummary(props: { path: string }) {
  const t = useTranslation()
  const page = LEGAL_PAGES.find((item) => item.path === props.path)
  if (!page?.points?.length) return null

  return (
    <section
      aria-labelledby="legal-summary-title"
      className="space-y-2 rounded-2xl border bg-muted/40 p-4 text-left"
    >
      <h2
        id="legal-summary-title"
        className="flex items-center gap-2 font-semibold"
      >
        <ListChecksIcon aria-hidden className="size-4 text-orange-500" />
        {t("このページの要点", "Summary")}
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
        {page.points.map((point) => (
          <li key={point.ja}>{t(point.ja, point.en)}</li>
        ))}
      </ul>
      <p className="text-muted-foreground text-xs">
        {t(
          "要点は読みやすくするための言い換えです。正式な内容は下の本文です。",
          "This summary is for convenience only; the full text below is what applies.",
        )}
      </p>
    </section>
  )
}

/**
 * 規約・ポリシーのページの下に出す、関連ページへのナビ（使い方ガイドへのリンクつき）
 */
export function LegalPageNav(props: { currentPath?: string }) {
  const t = useTranslation()
  const { pathname } = useLocation()
  const currentPath = props.currentPath ?? parseLocalePath(pathname).remainder

  return (
    <nav
      aria-labelledby="legal-nav-title"
      className="space-y-3 rounded-2xl border bg-card p-4 text-left"
    >
      <h2 id="legal-nav-title" className="font-bold text-lg">
        {t("規約・ポリシー", "Terms & policies")}
      </h2>
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {LEGAL_PAGES.map((page) => (
          <li key={page.path}>
            {page.path === currentPath ? (
              <span
                aria-current="page"
                className="flex items-center rounded-lg bg-muted px-2 py-1.5 font-semibold text-sm"
              >
                {t(page.title.ja, page.title.en)}
              </span>
            ) : (
              <Link
                to={page.path}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
              >
                {t(page.title.ja, page.title.en)}
                <ChevronRightIcon
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="border-t pt-3 text-muted-foreground text-sm">
        {t("使い方は", "For how-tos, see the")}{" "}
        <Link to="/help" className="underline">
          {t("使い方ガイド", "User Guide")}
        </Link>
        {t("、よくある質問は", " and the")}{" "}
        <Link to="/help/faq" className="underline">
          {t("よくある質問", "FAQ")}
        </Link>
        {t(" を見てください。", ".")}
      </p>
    </nav>
  )
}
