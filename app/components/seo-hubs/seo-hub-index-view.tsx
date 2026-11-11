import { useLocation } from "@remix-run/react"
import {
  BookOpenIcon,
  ChevronRightIcon,
  CpuIcon,
  HashIcon,
  LibraryIcon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react"
import { useDeferredValue, useState } from "react"
import type { Thing, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { GUIDE_SUMMARIES } from "~/lib/guides/guide-summaries"
import { getPathLocale } from "~/utils/locale-path"

type Item = { name: string; count: number }

type Props = {
  isSensitive: boolean
  characters: Item[]
  series: Item[]
  tags: Item[]
  models: Item[]
  generatedAt: string
}

const normalize = (text: string) => text.normalize("NFKC").toLowerCase()

function ItemLinks(props: {
  items: Item[]
  toPath: (name: string) => string
  filter: string
  large?: boolean
  collapseAfter?: number
  moreLabel: string
}) {
  const items = props.filter
    ? props.items.filter((item) => normalize(item.name).includes(props.filter))
    : props.items
  if (items.length === 0) return null
  // 長い一覧は後ろを畳む（閉じていてもリンクは HTML に残る）。絞り込み中はすべて出す
  const visibleCount = props.filter ? items.length : (props.collapseAfter ?? items.length)
  const renderList = (list: Item[]) => (
    <ul className="flex flex-wrap gap-2">
      {list.map((item) => (
        <li key={item.name}>
          <Link
            to={props.toPath(item.name)}
            className={
              props.large
                ? "inline-flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2 font-medium hover:border-foreground/40"
                : "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground/40"
            }
          >
            {item.name}
            <span className="font-normal text-muted-foreground text-xs">
              {item.count.toLocaleString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
  if (items.length <= visibleCount) return renderList(items)
  return (
    <div className="space-y-2">
      {renderList(items.slice(0, visibleCount))}
      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center rounded-full bg-muted px-4 py-1.5 text-sm hover:bg-muted/70 group-open:hidden">
          {props.moreLabel} {items.length - visibleCount}
        </summary>
        {renderList(items.slice(visibleCount))}
      </details>
    </div>
  )
}

/**
 * 呪文まとめの索引（/prompts・/r/prompts）
 */
export function SeoHubIndexView(props: Props) {
  const t = useTranslation()
  const location = useLocation()
  const locale = getPathLocale(location.pathname)
  const [query, setQuery] = useState("")
  const filter = normalize(useDeferredValue(query).trim())
  const prefix = props.isSensitive ? "/r" : ""
  const homeUrl = locale === "en" ? `${config.siteURL}/en` : config.siteURL
  const tagPath = (name: string) =>
    `${prefix}/prompts/tags/${encodeURIComponent(name)}`
  const modelPath = (name: string) =>
    `${prefix}/prompts/models/${encodeURIComponent(name)}`
  const title = props.isSensitive
    ? t("R18 AIイラストの呪文（プロンプト）まとめ", "R18 AI art prompt collections")
    : t(
        "AIイラストの呪文（プロンプト）まとめ",
        "AI art prompt collections",
      )

  const jsonLd: Array<WithContext<Thing>> = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: `${homeUrl}${prefix}/prompts`,
      inLanguage: locale,
      ...(props.isSensitive && { isFamilyFriendly: false }),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [...props.characters, ...props.series, ...props.tags]
          .slice(0, 30)
          .map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: `${homeUrl}${tagPath(item.name)}`,
          })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Aipictors", item: homeUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: t("呪文まとめ", "Prompt collections"),
          item: `${homeUrl}${prefix}/prompts`,
        },
      ],
    },
  ]

  const sections = [
    {
      id: "characters",
      icon: UserRoundIcon,
      title: t("キャラクター", "Characters"),
      items: props.characters,
      toPath: tagPath,
      large: true,
    },
    {
      id: "series",
      icon: LibraryIcon,
      title: t("作品・シリーズ", "Series"),
      items: props.series,
      toPath: tagPath,
      large: true,
    },
    {
      id: "tags",
      icon: HashIcon,
      title: t("人気のタグ", "Popular tags"),
      items: props.tags,
      toPath: tagPath,
      large: false,
      collapseAfter: 120,
    },
    {
      id: "models",
      icon: CpuIcon,
      title: t("モデル", "Models"),
      items: props.models,
      toPath: modelPath,
      large: false,
      collapseAfter: 40,
    },
  ].filter((section) => section.items.length > 0)

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 pb-12">
      <AppJsonLdScript jsonLd={jsonLd} />
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to={prefix || "/"} className="hover:text-foreground">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRightIcon className="size-3" />
        <span className="text-foreground">{t("呪文まとめ", "Prompts")}</span>
      </nav>

      <header className="space-y-3">
        <h1 className="font-bold text-2xl tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed md:text-base">
          {t(
            "Aipictorsに投稿されたAIイラストのうち、呪文（プロンプト）を公開している人気作品を、キャラクター・タグ・モデルごとに集計しました。よく使われる語・使われたモデル・呪文の例・人気作品をまとめて見られます。数字は作品数です。",
            "We counted the public prompts of popular AI illustrations on Aipictors by character, tag and model. See common words, models, example prompts and popular works. Numbers are work counts.",
          )}
        </p>
        <nav className="flex flex-wrap gap-2 text-sm">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full bg-muted px-3 py-1.5 hover:bg-muted/70"
            >
              {section.title}
            </a>
          ))}
          {!props.isSensitive && locale === "ja" && (
            <a
              href="#guides"
              className="rounded-full bg-muted px-3 py-1.5 hover:bg-muted/70"
            >
              作り方ガイド
            </a>
          )}
        </nav>
        <div className="relative max-w-md">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("名前で絞り込む", "Filter by name")}
            className="rounded-full pl-9"
            aria-label={t("名前で絞り込む", "Filter by name")}
          />
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="scroll-mt-20 space-y-3"
        >
          <h2
            id={`${section.id}-heading`}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <section.icon className="size-5 text-muted-foreground" />
            {section.title}
          </h2>
          <ItemLinks
            items={section.items}
            toPath={section.toPath}
            filter={filter}
            large={section.large}
            collapseAfter={"collapseAfter" in section ? section.collapseAfter : undefined}
            moreLabel={t("さらに表示", "Show more")}
          />
        </section>
      ))}

      {!props.isSensitive && locale === "ja" && (
        <section id="guides" className="scroll-mt-20 space-y-3">
          <h2 className="flex items-center gap-2 font-bold text-xl">
            <BookOpenIcon className="size-5 text-muted-foreground" />
            AIイラストの作り方ガイド
          </h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {GUIDE_SUMMARIES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 hover:border-foreground/40"
                >
                  <span className="font-semibold">{guide.title}</span>
                  <span className="text-muted-foreground text-sm">
                    {guide.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-muted-foreground text-xs">
        {t(
          `作品数は ${props.generatedAt} 時点の集計です。各ページの呪文・作品は毎日更新されます。`,
          `Work counts as of ${props.generatedAt}. Prompts and works on each page are updated daily.`,
        )}
      </p>
    </div>
  )
}
