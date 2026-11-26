import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import type { BreadcrumbList, FAQPage, WithContext } from "schema-dts"
import { LegalPageNav } from "~/components/legal-page-nav"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  HELP_DISCORD_URL,
  HELP_STATUS_URL,
} from "~/routes/($lang)._main.help._index/components/help-guide-meta"
import type {
  HelpFaq,
  HelpSection,
} from "~/routes/($lang)._main.help._index/components/help-sections"

export const HELP_SITE_URL = "https://www.aipictors.com"

/** 章のページの URL（/help/coins など） */
export const helpSectionPath = (section: Pick<HelpSection, "id">) =>
  `/help/${section.id}`

/** 構造化データに入れる絶対 URL（英語は /en を付ける） */
export const toHelpAbsoluteUrl = (path: string, isEnglish: boolean) =>
  `${HELP_SITE_URL}${isEnglish ? "/en" : ""}${path}`

/** パンくずの構造化データ（Aipictors → 使い方ガイド → …） */
export function createHelpBreadcrumb(
  isEnglish: boolean,
  items: Array<{ name: string; path: string }>,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${HELP_SITE_URL}${isEnglish ? "/en" : "/"}`,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: item.name,
        item: toHelpAbsoluteUrl(item.path, isEnglish),
      })),
    ],
  }
}

/** よくある質問の構造化データ */
export function createHelpFaqJsonLd(
  isEnglish: boolean,
  faqs: HelpFaq[],
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: isEnglish ? "en" : "ja",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: isEnglish ? faq.q.en : faq.q.ja,
      acceptedAnswer: {
        "@type": "Answer",
        text: isEnglish ? faq.a.en : faq.a.ja,
      },
    })),
  }
}

/** 画面に出すパンくず */
export function HelpBreadcrumbNav(props: {
  items: Array<{ label: string; to?: string }>
}) {
  const t = useTranslation()
  return (
    <nav aria-label={t("パンくずリスト", "Breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground text-sm">
        <li>
          <Link to="/help" className="hover:text-foreground hover:underline">
            {t("使い方ガイド", "User Guide")}
          </Link>
        </li>
        {props.items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRightIcon aria-hidden className="size-3.5" />
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** ヘルプ内を検索する入力欄（絞り込みはブラウザの中だけ） */
export function HelpSearchInput(props: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const t = useTranslation()
  return (
    <div className="relative">
      <SearchIcon
        aria-hidden
        className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-5 text-muted-foreground"
      />
      <input
        type="search"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={
          props.placeholder ??
          t(
            "ヘルプ内を検索（例: コイン 期限、解約、閲覧数）",
            "Search the guide (e.g. coins expire, cancel, views)",
          )
        }
        aria-label={t("ヘルプ内を検索", "Search the guide")}
        className="h-12 w-full rounded-full border bg-background pr-11 pl-11 text-base shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {props.value.length > 0 && (
        <button
          type="button"
          onClick={() => props.onChange("")}
          aria-label={t("検索をクリア", "Clear search")}
          className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

/** よくある質問 1 件（中身は HTML に含め、開け閉めは details） */
export function HelpFaqItem(props: {
  faq: HelpFaq
  /** どの章の質問か（全 FAQ の一覧・検索結果で出す） */
  section?: HelpSection
  isOpen?: boolean
}) {
  const t = useTranslation()
  const { faq, section } = props
  return (
    <details className="group p-4" open={props.isOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-semibold">
        <h3 className="leading-6">{t(faq.q.ja, faq.q.en)}</h3>
        <ChevronDownIcon
          aria-hidden
          className="mt-1 size-4 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <p className="mt-2 text-muted-foreground text-sm leading-6">
        {t(faq.a.ja, faq.a.en)}
      </p>
      {section && (
        <Link
          to={helpSectionPath(section)}
          className="mt-2 inline-flex items-center gap-1 text-orange-600 text-xs hover:underline dark:text-orange-300"
        >
          {section.emoji} {t(section.title.ja, section.title.en)}
          {t(" の章を読む", "")}
          <ChevronRightIcon aria-hidden className="size-3" />
        </Link>
      )}
    </details>
  )
}

/** 困ったときの窓口（チャットサポート・Discord・通報・障害のとき） */
export function HelpContactSection() {
  const t = useTranslation()
  const channels = [
    {
      title: t("チャットサポート（AI）", "Chat support (AI)"),
      body: t(
        "プランやコインの状況を見て、AI がすぐに答えます（ログインが必要）。人のスタッフが答える窓口ではありません。",
        "An AI answers right away using your plan and coin status (login required). It isn't staffed by people.",
      ),
      action: (
        <Link
          to="/support/chat"
          className="font-medium text-orange-600 text-sm hover:underline dark:text-orange-300"
        >
          {t("チャットで聞く", "Ask in chat")} →
        </Link>
      ),
    },
    {
      title: "Discord",
      body: t(
        "AI で解決しないこと（返金・二重請求・ログインできない・運営の対応への異議など）や、不具合・要望はこちら。ぴくたーちゃん（bot）と運営が答えます。運営の返事には時間がかかることがあります。公開の場なので、カード番号・パスワード・メールアドレスは書かないでください。",
        "For things the AI can't solve (refunds, double charges, login trouble, appeals) and bug reports or requests. Pictor-chan (bot) and our team reply; team replies can take time. It's public, so never post card numbers, passwords or email addresses.",
      ),
      action: (
        <a
          href={HELP_DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-orange-600 text-sm hover:underline dark:text-orange-300"
        >
          {t("Discord に参加", "Join Discord")}
          <ExternalLinkIcon aria-hidden className="size-3.5" />
        </a>
      ),
    },
    {
      title: t("違反の通報", "Reporting violations"),
      body: t(
        "規約に反する作品・コメントは、作品ページの「…」→「問題を報告する」から。Discord などに作品の URL を貼らないでください。",
        'Report rule-breaking works or comments from "…" → "Report a problem" on the work page. Please don\'t post the link on Discord.',
      ),
      action: (
        <Link
          to="/help/safety"
          className="font-medium text-orange-600 text-sm hover:underline dark:text-orange-300"
        >
          {t("通報とブロック", "Reporting & blocking")} →
        </Link>
      ),
    },
    {
      title: t("つながらない・障害のとき", "Site down or not working"),
      body: t(
        "サイトの稼働状況のページと、お知らせを見てください。自分だけのときは、ページの再読み込み・別のブラウザ・キャッシュの削除を試してください。",
        "Check the status page and announcements. If it's only you, try reloading, another browser or clearing the cache.",
      ),
      action: (
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          <a
            href={HELP_STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-orange-600 text-sm hover:underline dark:text-orange-300"
          >
            {t("稼働状況", "Status page")}
            <ExternalLinkIcon aria-hidden className="size-3.5" />
          </a>
          <Link
            to="/releases"
            className="font-medium text-orange-600 text-sm hover:underline dark:text-orange-300"
          >
            {t("お知らせ", "Announcements")} →
          </Link>
        </span>
      ),
    },
  ]

  return (
    <section
      aria-labelledby="help-contact-title"
      className="space-y-3 rounded-3xl bg-linear-to-r from-sky-100 to-violet-100 p-4 sm:p-6 dark:from-sky-950 dark:to-violet-950"
    >
      <h2 id="help-contact-title" className="font-bold text-xl">
        {t("困ったときは", "Need help?")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => (
          <div
            key={channel.title}
            className="space-y-1.5 rounded-2xl bg-white/80 p-4 dark:bg-slate-900/70"
          >
            <h3 className="font-semibold">{channel.title}</h3>
            <p className="text-sm leading-6">{channel.body}</p>
            {channel.action}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        {t(
          "法人（ビジネス）のお問い合わせは、お問い合わせのページのメールアドレスへ。",
          "For business inquiries, use the email address on the contact page.",
        )}{" "}
        <Link to="/contact" className="underline">
          {t("お問い合わせ", "Contact")}
        </Link>
      </p>
    </section>
  )
}

/** 規約・ポリシーへのリンク集（規約のページの下と同じもの） */
export function HelpLegalLinks() {
  return <LegalPageNav />
}
