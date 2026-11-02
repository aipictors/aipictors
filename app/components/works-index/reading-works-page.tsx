import { Form, Link, useLocation } from "@remix-run/react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { PictorChanHint } from "~/components/works-index/pictor-chan-hint"
import { ReadingWorkCard } from "~/components/works-index/reading-work-card"
import {
  READING_CONFIGS,
  READING_EMPTY_HINTS,
  type ReadingSort,
} from "~/components/works-index/reading-works-config"
import type { ReadingWorksData } from "~/components/works-index/reading-works-loader.server"
import { WorksIndexPagination } from "~/components/works-index/works-index-pagination"
import {
  toWorksIndexSearch,
  WORKS_INDEX_PER_PAGE,
} from "~/components/works-index/works-index-params"
import { WorksIndexSortTabs } from "~/components/works-index/works-index-sort-tabs"
import { config as siteConfig } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { getPathLocale } from "~/utils/locale-path"

type Props = {
  data: ReadingWorksData
}

const SORT_LABELS: Record<ReadingSort, readonly [string, string]> = {
  new: ["新着順", "Latest"],
  popular: ["人気順", "Most liked"],
}

/**
 * 読みもの（小説・コラム）の一覧
 * 検索・並び替え・ページ送りはすべて URL で表すので、hydration の前でも動き、サーバーで HTML を描ける
 */
export function ReadingWorksPage(props: Props) {
  const t = useTranslation()
  const location = useLocation()
  const { data } = props
  const reading = READING_CONFIGS[data.kind]

  const isEnglish = getPathLocale(location.pathname) === "en"
  const localePrefix = isEnglish ? "/en" : ""
  const toPath = (path: string) => `${localePrefix}${path}`
  const text = (value: readonly [string, string]) => t(value[0], value[1])

  const sortParam = data.sort === reading.defaultSort ? null : data.sort
  const toHref = (page: number) =>
    `${toPath(reading.path)}${toWorksIndexSearch({ q: data.q, sort: sortParam, page })}`

  // 既定の並びを左に置く
  const sorts: ReadingSort[] =
    reading.defaultSort === "new" ? ["new", "popular"] : ["popular", "new"]

  const homeUrl = `${siteConfig.siteURL}${localePrefix}`
  const pageUrl = `${homeUrl}${reading.path}`

  const collectionPage: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: text(reading.h1),
    description: text(reading.description),
    url: pageUrl,
    inLanguage: isEnglish ? "en" : "ja",
    isPartOf: { "@type": "WebSite", name: "Aipictors", url: `${homeUrl}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.count,
      itemListElement: data.works.map((work, index) => ({
        "@type": "ListItem",
        position: data.page * WORKS_INDEX_PER_PAGE + index + 1,
        name: work.title,
        url: `${homeUrl}/posts/${work.id}`,
      })),
    },
  }

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${homeUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("すべての作品", "All works"),
        item: `${homeUrl}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: text(reading.name),
        item: pageUrl,
      },
    ],
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-16 md:space-y-5">
      <AppJsonLdScript jsonLd={[collectionPage, breadcrumb]} />

      <header className="space-y-2">
        <h1 className="font-black text-xl md:text-2xl">
          {text(reading.h1)}
          {data.page > 0 && (
            <span className="ml-2 font-medium text-muted-foreground text-sm">
              {t(`${data.page + 1}ページ目`, `Page ${data.page + 1}`)}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {text(reading.lead)}
        </p>
        {data.q === "" && data.page === 0 && (
          <PictorChanHint lines={reading.hints} seed={data.seed} />
        )}
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Form
          method="get"
          action={toPath(reading.path)}
          className="flex w-full items-center gap-1.5 sm:max-w-sm"
        >
          {sortParam !== null && (
            <input type="hidden" name="sort" value={sortParam} />
          )}
          <Input
            // 検索語が変わったら入力欄も合わせる
            key={data.q}
            type="search"
            name="q"
            defaultValue={data.q}
            maxLength={50}
            enterKeyHint="search"
            aria-label={text(reading.searchPlaceholder)}
            placeholder={text(reading.searchPlaceholder)}
            className="h-9 rounded-full text-base md:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            variant="secondary"
            aria-label={t("検索", "Search")}
            className="size-9 shrink-0 rounded-full"
          >
            <SearchIcon className="size-4" />
          </Button>
        </Form>
        <WorksIndexSortTabs
          label={t("並び順", "Sort")}
          current={data.sort}
          items={sorts.map((value) => ({
            value,
            label: SORT_LABELS[value],
            href: `${toPath(reading.path)}${toWorksIndexSearch({
              q: data.q,
              sort: value === reading.defaultSort ? null : value,
            })}`,
          }))}
        />
      </div>

      <h2 className="flex flex-wrap items-baseline gap-x-2 font-bold text-base md:text-lg">
        {data.q === ""
          ? t(
              `すべての${reading.name[0]}`,
              `All ${reading.name[1].toLowerCase()}`,
            )
          : t(`「${data.q}」の${reading.name[0]}`, `Results for "${data.q}"`)}
        <span className="font-normal text-muted-foreground text-xs">
          {t(`${data.count.toLocaleString()}作品`, `${data.count} works`)}
        </span>
        {data.q !== "" && (
          <Link
            to={`${toPath(reading.path)}${toWorksIndexSearch({ sort: sortParam })}`}
            className="font-normal text-muted-foreground text-xs underline underline-offset-2"
          >
            {t("検索をやめる", "Clear search")}
          </Link>
        )}
      </h2>

      {data.works.length === 0 ? (
        <div className="flex justify-center rounded-xl border border-dashed px-4 py-10">
          <PictorChanHint lines={READING_EMPTY_HINTS} />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3">
          {data.works.map((work, index) => (
            <li key={work.id} className="min-w-0">
              <ReadingWorkCard
                work={work}
                to={toPath(`/posts/${work.id}`)}
                userTo={toPath(`/users/${work.user?.id}`)}
                isPriority={index === 0 && data.page === 0}
              />
            </li>
          ))}
        </ul>
      )}

      <WorksIndexPagination
        page={data.page}
        lastPage={data.lastPage}
        toHref={toHref}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm">
        <Link
          to={toPath(reading.otherLink.path)}
          className="flex items-center gap-1 font-medium hover:underline"
        >
          {text(reading.otherLink.label)}
          <ArrowRightIcon className="size-3.5" />
        </Link>
        <Link
          to={toPath("/posts")}
          className="flex items-center gap-1 font-medium hover:underline"
        >
          {t("すべての作品を見る", "See all works")}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
