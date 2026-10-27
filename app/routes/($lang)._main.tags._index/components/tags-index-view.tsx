import { Link, useLocation, useNavigate } from "@remix-run/react"
import { HashIcon, SearchIcon, TrendingUpIcon } from "lucide-react"
import { type FormEvent, useState } from "react"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { getPathLocale } from "~/utils/locale-path"

type Props = {
  isSensitive: boolean
  hotTags: { name: string; worksCount: number; thumbnailUrl: string | null }[]
  popularTags: { name: string; thumbnailUrl: string | null }[]
  commonTags: string[]
}

function TagImageCard(props: {
  to: string
  name: string
  thumbnailUrl: string | null
  caption?: string
  isPriority?: boolean
}) {
  return (
    <Link
      to={props.to}
      className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted"
    >
      {props.thumbnailUrl && (
        <img
          src={props.thumbnailUrl}
          alt=""
          loading={props.isPriority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <p className="truncate font-bold text-sm text-white drop-shadow md:text-base">
          <span className="mr-0.5 opacity-70">#</span>
          {props.name}
        </p>
        {props.caption && (
          <p className="mt-0.5 text-[11px] text-white/80">{props.caption}</p>
        )}
      </div>
    </Link>
  )
}

/**
 * タグ一覧（/tags）
 */
export function TagsIndexView(props: Props) {
  const t = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const locale = getPathLocale(location.pathname)
  const [text, setText] = useState("")

  const tagPath = (name: string) =>
    `${props.isSensitive ? "/r" : ""}/tags/${encodeURIComponent(name)}`

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim().replace(/^#+/, "")
    if (!value) return
    navigate(tagPath(value))
  }

  const homeUrl = locale === "en" ? `${config.siteURL}/en` : config.siteURL
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("タグ一覧", "Tags"),
    url: `${homeUrl}/tags`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [...props.hotTags, ...props.popularTags].map(
        (tag, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tag.name,
          url: `${homeUrl}/tags/${encodeURIComponent(tag.name)}`,
        }),
      ),
    },
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 pb-12">
      {!props.isSensitive && (
        <AppJsonLdScript
          jsonLd={
            jsonLd as unknown as Parameters<typeof AppJsonLdScript>[0]["jsonLd"]
          }
        />
      )}

      {/* ヘッダー */}
      <header className="relative overflow-hidden rounded-2xl border bg-card p-5 md:p-8">
        <div className="-top-10 -right-10 pointer-events-none absolute size-56 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="-bottom-16 -left-10 pointer-events-none absolute size-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="relative max-w-2xl space-y-3">
          <p className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
            <HashIcon className="size-3.5" />
            {t("タグ", "Tags")}
          </p>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            {props.isSensitive
              ? t("センシティブなタグ", "Sensitive tags")
              : t("タグからAIイラストを探す", "Find AI art by tag")}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              "作品に付けられたタグから、好きなジャンル・キャラクター・雰囲気のAIイラストを探せます。タグ名を入れるとそのタグの作品一覧を開きます。",
              "Find AI illustrations by genre, character or mood. Enter a tag name to open its works.",
            )}
          </p>
          <form onSubmit={onSubmit} className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <HashIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={t("タグ名（例: 猫耳、夜景）", "Tag name")}
                className="h-11 rounded-full pl-9"
                aria-label={t("タグ名", "Tag name")}
              />
            </div>
            <Button type="submit" className="h-11 rounded-full px-5">
              <SearchIcon className="mr-1 size-4" />
              {t("開く", "Open")}
            </Button>
          </form>
          <p className="text-muted-foreground text-xs">
            {t("タイトルや説明からも探したいときは", "To search titles too, use ")}
            <Link to="/search" className="text-primary hover:underline">
              {t("作品検索", "Search")}
            </Link>
            {t("へ", "")}
          </p>
        </div>
      </header>

      {/* いま増えているタグ */}
      {props.hotTags.length > 0 && (
        <section aria-labelledby="hot-tags-heading" className="space-y-4">
          <div className="flex items-end justify-between">
            <h2
              id="hot-tags-heading"
              className="flex items-center gap-1.5 font-bold text-lg md:text-xl"
            >
              <TrendingUpIcon className="size-5 text-rose-500" />
              {t("いま増えているタグ", "Trending tags")}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("最近の投稿で多く使われているタグ", "Used a lot recently")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {props.hotTags.map((tag, index) => (
              <TagImageCard
                key={tag.name}
                to={tagPath(tag.name)}
                name={tag.name}
                thumbnailUrl={tag.thumbnailUrl}
                isPriority={index < 6}
                caption={t(
                  `最近 ${tag.worksCount.toLocaleString()}件`,
                  `${tag.worksCount.toLocaleString()} recent works`,
                )}
              />
            ))}
          </div>
        </section>
      )}

      {/* 人気のタグ */}
      {props.popularTags.length > 0 && (
        <section aria-labelledby="popular-tags-heading" className="space-y-4">
          <h2 id="popular-tags-heading" className="font-bold text-lg md:text-xl">
            {t("人気のタグ", "Popular tags")}
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6 xl:grid-cols-8">
            {props.popularTags.map((tag) => (
              <TagImageCard
                key={tag.name}
                to={tagPath(tag.name)}
                name={tag.name}
                thumbnailUrl={tag.thumbnailUrl}
              />
            ))}
          </div>
        </section>
      )}

      {/* よく使われるタグ */}
      {props.commonTags.length > 0 && (
        <section aria-labelledby="common-tags-heading" className="space-y-4">
          <h2 id="common-tags-heading" className="font-bold text-lg md:text-xl">
            {t("定番のタグ", "Common tags")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {props.commonTags.map((name) => (
              <Link
                key={name}
                to={tagPath(name)}
                className="inline-flex h-9 items-center rounded-full border bg-background px-4 font-medium text-sm transition-colors hover:border-foreground/40"
              >
                <span className="mr-0.5 text-muted-foreground">#</span>
                {name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-muted/30 p-5 text-muted-foreground text-sm leading-relaxed md:p-7">
        <h2 className="mb-2 font-bold text-base text-foreground">
          {t("タグについて", "About tags")}
        </h2>
        <p>
          {t(
            "Aipictors では投稿者が作品にタグを付けています。タグのページでは、そのタグが付いた作品を人気順・新着順で見られるほか、関連するタグやよく投稿しているユーザーもわかります。気になるタグはフォローすると、新しい作品をホームで確認できます。",
            "Creators add tags to their works. Each tag page lists works by popularity or date, with related tags and top creators. Follow a tag to see new works on your home feed.",
          )}
        </p>
      </section>
    </div>
  )
}
