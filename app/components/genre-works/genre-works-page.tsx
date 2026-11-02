import { Link, useLocation } from "@remix-run/react"
import {
  ArrowRightIcon,
  ChevronRightIcon,
  HashIcon,
  ImagePlusIcon,
  TrophyIcon,
  WandSparklesIcon,
  HeartIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import type {
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  WithContext,
} from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { GenreNewWorks } from "~/components/genre-works/genre-new-works"
import { GenreWorkCard } from "~/components/genre-works/genre-work-card"
import {
  GENRE_KEYS,
  type GenreConfig,
  type GenreKey,
  type GenreSectionKey,
  toGenreConfig,
} from "~/components/genre-works/genre-works-config"
import type { GenreWorksData } from "~/components/genre-works/genre-works-loader.server"
import { OptimizedImage } from "~/components/optimized-image"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getPathLocale } from "~/utils/locale-path"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"

type Props = {
  genreKey: GenreKey
  data: GenreWorksData
  /** R18 の入口として出す */
  isSensitive?: boolean
}

/** 人気作品の横スクロール（スマホ）と格子（PC）の共通クラス */
const WORK_ROW_CLASS_NAME =
  "-mx-3 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden"

const WORK_ROW_ITEM_CLASS_NAME = "w-40 shrink-0 snap-start md:w-auto"

const WORK_ROW_SIZES =
  "(min-width: 1024px) 240px, (min-width: 768px) 25vw, 160px"

/**
 * ジャンル（2D / 2.5D / 3D）の入口ページ
 * データは loader で取り、ファーストビューは hydration の前に完成させる。
 * 文章・タグ・並びは genre-works-config で切り替える
 */
export function GenreWorksPage(props: Props) {
  const t = useTranslation()
  const location = useLocation()
  const isSensitive = props.isSensitive === true
  const genre = toGenreConfig(props.genreKey, isSensitive)
  const { data } = props

  const isEnglish = getPathLocale(location.pathname) === "en"
  const localePrefix = isEnglish ? "/en" : ""
  /** 作品・タグ・ランキングなど、R18 では /r のページがあるもの */
  const toPath = (path: string) =>
    `${localePrefix}${isSensitive ? "/r" : ""}${path}`
  /** 生成・モデル・ガイドラインなど、全年齢と R18 で同じページ */
  const toSharedPath = (path: string) => `${localePrefix}${path}`
  const text = (value: readonly [string, string]) => t(value[0], value[1])

  const homeUrl = `${config.siteURL}${localePrefix}`
  const sectionUrl = `${homeUrl}${isSensitive ? "/r" : ""}`
  const pageUrl = `${sectionUrl}${genre.path}`

  const collectionPage: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: text(genre.h1),
    description: text(genre.lead),
    url: pageUrl,
    inLanguage: isEnglish ? "en" : "ja",
    isPartOf: { "@type": "WebSite", name: "Aipictors", url: `${homeUrl}/` },
    ...(isSensitive
      ? { isFamilyFriendly: false }
      : {
          mainEntity: {
            "@type": "ItemList",
            name: text(genre.rankingTitle),
            itemListElement: data.rankingWorks.map((work, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: work.title,
              url: `${homeUrl}/posts/${work.id}`,
            })),
          },
        }),
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
        name: text(genre.name),
        item: pageUrl,
      },
    ],
  }

  const faqPage: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: genre.faqs.map((faq) => ({
      "@type": "Question",
      name: text(faq.question),
      acceptedAnswer: { "@type": "Answer", text: text(faq.answer) },
    })),
  }

  const sections: Record<GenreSectionKey, ReactNode> = {
    tastes: (data.tastes.length > 0 || data.trendingTags.length > 0) && (
      <GenreTastes
        key="tastes"
        genre={genre}
        tastes={data.tastes}
        trendingTags={data.trendingTags}
        toPath={toPath}
      />
    ),
    ranking: data.rankingWorks.length > 0 && (
      <GenreSection
        key="ranking"
        id="genre-ranking"
        icon={<TrophyIcon className="size-5 text-amber-500" />}
        title={text(genre.rankingTitle)}
        lead={text(genre.rankingLead)}
        link={{
          to: toPath("/rankings"),
          label: t("全体のランキング", "All rankings"),
        }}
      >
        <ol className={WORK_ROW_CLASS_NAME}>
          {data.rankingWorks.map((work, index) => (
            <li key={work.id} className={WORK_ROW_ITEM_CLASS_NAME}>
              <GenreWorkCard
                work={work}
                to={toPath(`/posts/${work.id}`)}
                userTo={toPath(`/users/${work.user?.id}`)}
                aspectClassName={genre.cardAspect}
                sizes={WORK_ROW_SIZES}
                rank={index + 1}
              />
            </li>
          ))}
        </ol>
      </GenreSection>
    ),
    classics: data.classicWorks.length > 0 && (
      <GenreSection
        key="classics"
        id="genre-classics"
        icon={<HeartIcon className="size-5 text-rose-500" />}
        title={text(genre.classicsTitle)}
        lead={text(genre.classicsLead)}
      >
        <ul className={WORK_ROW_CLASS_NAME}>
          {data.classicWorks.map((work) => (
            <li key={work.id} className={WORK_ROW_ITEM_CLASS_NAME}>
              <GenreWorkCard
                work={work}
                to={toPath(`/posts/${work.id}`)}
                userTo={toPath(`/users/${work.user?.id}`)}
                aspectClassName={genre.cardAspect}
                sizes={WORK_ROW_SIZES}
              />
            </li>
          ))}
        </ul>
      </GenreSection>
    ),
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-10 pb-12">
      <AppJsonLdScript
        jsonLd={
          // R18 は検索結果に質問と答えを広げない
          isSensitive
            ? [collectionPage, breadcrumb]
            : [collectionPage, breadcrumb, faqPage]
        }
      />

      <GenreHero
        genre={genre}
        works={data.heroWorks}
        covers={data.covers}
        toPath={toPath}
        toSharedPath={toSharedPath}
      />

      {genre.sectionOrder.map((key) => sections[key])}

      <GenreNewWorks
        genre={genre}
        works={data.newWorks}
        userLinkPrefix={toPath("/users")}
      />

      <GenreHowTo genre={genre} toPath={toPath} toSharedPath={toSharedPath} />

      <section
        aria-labelledby="genre-about-heading"
        className="grid gap-6 rounded-2xl border bg-card p-5 text-sm leading-relaxed md:grid-cols-2 md:p-7"
      >
        <div className="space-y-3">
          <h2 id="genre-about-heading" className="font-bold text-lg">
            {text(genre.aboutTitle)}
          </h2>
          {genre.about.map((paragraph) => (
            <p key={paragraph[0]} className="text-muted-foreground">
              {text(paragraph)}
            </p>
          ))}
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <Link className="text-primary underline" to={toPath("/rankings")}>
                {t("ランキング", "Rankings")}
              </Link>
            </li>
            <li>
              <Link className="text-primary underline" to={toPath("/tags")}>
                {t("タグ一覧", "All tags")}
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline"
                to={toSharedPath("/models")}
              >
                {t("モデル一覧", "Models")}
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline"
                to={toSharedPath("/guideline")}
              >
                {t("ガイドライン", "Guidelines")}
              </Link>
            </li>
            {isSensitive && (
              <li>
                <Link
                  className="text-primary underline"
                  to={toSharedPath("/terms/r18")}
                >
                  {t("R18規約", "R18 terms")}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="font-bold text-lg">{t("よくある質問", "FAQ")}</h2>
          <div className="space-y-2">
            {genre.faqs.map((faq) => (
              <details
                key={faq.question[0]}
                className="rounded-lg border bg-background p-3"
              >
                <summary className="cursor-pointer font-semibold">
                  {text(faq.question)}
                </summary>
                <p className="mt-2 text-muted-foreground">{text(faq.answer)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <GenreRelated genre={genre} covers={data.covers} toPath={toPath} />
    </div>
  )
}

function GenreSection(props: {
  id: string
  icon?: ReactNode
  title: string
  lead?: string
  link?: { to: string; label: string }
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={`${props.id}-heading`}
      className="min-w-0 space-y-4"
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2
            id={`${props.id}-heading`}
            className="flex items-center gap-1.5 font-bold text-lg md:text-xl"
          >
            {props.icon}
            {props.title}
          </h2>
          {props.lead && (
            <p className="text-muted-foreground text-xs md:text-sm">
              {props.lead}
            </p>
          )}
        </div>
        {props.link && (
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-full"
          >
            <Link to={props.link.to}>{props.link.label}</Link>
          </Button>
        )}
      </div>
      {props.children}
    </section>
  )
}

function GenreHero(props: {
  genre: GenreConfig
  works: GenreWorksData["heroWorks"]
  covers: GenreWorksData["covers"]
  toPath: (path: string) => string
  toSharedPath: (path: string) => string
}) {
  const t = useTranslation()
  const { genre } = props
  const text = (value: readonly [string, string]) => t(value[0], value[1])
  const isFilmstrip = genre.heroLayout === "filmstrip"

  return (
    <header className="relative overflow-hidden rounded-2xl border bg-card p-4 md:p-7">
      <div
        className={cn(
          "-top-16 -right-10 pointer-events-none absolute size-72 rounded-full blur-3xl",
          genre.blobs[0],
        )}
      />
      <div
        className={cn(
          "-bottom-20 -left-10 pointer-events-none absolute size-72 rounded-full blur-3xl",
          genre.blobs[1],
        )}
      />
      <div
        className={cn(
          "relative grid gap-5 md:gap-7",
          !isFilmstrip &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center",
        )}
      >
        <div className="min-w-0 space-y-4">
          <nav aria-label={t("パンくずリスト", "Breadcrumb")}>
            <ol className="flex items-center gap-1 text-muted-foreground text-xs">
              <li>
                <Link
                  to={genre.isSensitive ? props.toPath("") : props.toPath("/")}
                  className="hover:underline"
                >
                  {genre.isSensitive ? "R18" : t("ホーム", "Home")}
                </Link>
              </li>
              <ChevronRightIcon aria-hidden={true} className="size-3" />
              <li aria-current="page">{text(genre.name)}</li>
            </ol>
          </nav>
          <h1 className="font-bold text-2xl leading-tight tracking-tight [text-wrap:balance] md:text-4xl">
            {text(genre.h1)}
          </h1>
          <p
            className={cn(
              "text-muted-foreground text-sm leading-relaxed md:text-base",
              isFilmstrip && "max-w-3xl",
            )}
          >
            {text(genre.lead)}
          </p>
          <GenreSwitcher
            current={genre.key}
            covers={props.covers}
            toPath={props.toPath}
            isSensitive={genre.isSensitive}
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-11 rounded-full px-5">
              <Link to={props.toSharedPath("/generation")}>
                <WandSparklesIcon className="mr-1.5 size-4" />
                {t("このテイストを作る", "Make your own")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full bg-background/60 px-5"
            >
              <Link to={props.toPath("/new/image")}>
                <ImagePlusIcon className="mr-1.5 size-4" />
                {t("作品を投稿", "Post a work")}
              </Link>
            </Button>
          </div>
        </div>
        {props.works.length > 0 && (
          <GenreHeroImages
            genre={genre}
            works={props.works}
            toPath={props.toPath}
          />
        )}
      </div>
    </header>
  )
}

/**
 * ファーストビューの画像（ジャンルごとに並べ方を変える）
 * スマホは 3 枚だけ、枠の大きさは CSS で先に決める
 */
function GenreHeroImages(props: {
  genre: GenreConfig
  works: GenreWorksData["heroWorks"]
  toPath: (path: string) => string
}) {
  const layout = props.genre.heroLayout

  const gridClassName = {
    mosaic: "grid-cols-3 md:grid-cols-4 md:grid-rows-2",
    stagger: "grid-cols-3",
    filmstrip: "grid-cols-3 md:grid-cols-5",
  }[layout]

  const itemClassName = (index: number) => {
    if (layout === "mosaic") {
      return index === 0
        ? "aspect-[3/4] md:col-span-2 md:row-span-2 md:aspect-auto md:h-full"
        : "aspect-[3/4] md:aspect-square"
    }
    if (layout === "stagger") {
      return cn("aspect-[3/4]", index % 2 === 1 && "md:translate-y-4")
    }
    return "aspect-[3/4] md:aspect-[4/5]"
  }

  return (
    <ul
      className={cn(
        "grid min-w-0 gap-2 md:gap-3",
        gridClassName,
        layout === "stagger" && "md:pb-4",
      )}
    >
      {props.works.map((work, index) => {
        // 大きく見せる枠は元の画像が小さいとぼやけるので、大きいサムネイルを使う
        const isBig = layout === "mosaic" && index === 0
        const imageUrl = isBig
          ? work.largeThumbnailImageURL
          : work.smallThumbnailImageURL
        const width = isBig
          ? work.largeThumbnailImageWidth
          : work.smallThumbnailImageWidth
        const height = isBig
          ? work.largeThumbnailImageHeight
          : work.smallThumbnailImageHeight
        return (
          <li
            key={work.id}
            className={cn(
              "relative min-w-0 overflow-hidden rounded-xl bg-muted",
              itemClassName(index),
              index >= 3 &&
                (layout === "stagger" ? "hidden" : "hidden md:block"),
            )}
          >
            <Link
              to={props.toPath(`/posts/${work.id}`)}
              className="group absolute inset-0 block"
              aria-label={work.title}
            >
              <OptimizedImage
                src={toResizedImageUrl(imageUrl, isBig ? 640 : 320) ?? imageUrl}
                srcSet={toResizedImageSrcSet(imageUrl, {
                  minWidth: 160,
                  maxWidth: width || undefined,
                })}
                sizes={
                  isBig
                    ? "(min-width: 1024px) 300px, 33vw"
                    : "(min-width: 1024px) 220px, 33vw"
                }
                alt={work.title}
                width={width}
                height={height}
                loading={index < 3 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function GenreSwitcher(props: {
  current: GenreKey
  covers: GenreWorksData["covers"]
  toPath: (path: string) => string
  isSensitive: boolean
}) {
  const t = useTranslation()

  return (
    <nav aria-label={t("テイストの切り替え", "Switch taste")}>
      <ul className="flex gap-2">
        {GENRE_KEYS.map((key) => {
          const item = toGenreConfig(key, props.isSensitive)
          const isCurrent = key === props.current
          const cover = props.covers[key]
          return (
            <li key={key} className="min-w-0">
              <Link
                to={props.toPath(item.path)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-1.5 rounded-full border py-1 pr-3.5 pl-1 font-semibold text-sm transition-colors",
                  isCurrent
                    ? "border-foreground bg-foreground text-background"
                    : "bg-background/70 hover:border-foreground/40",
                )}
              >
                {cover ? (
                  <img
                    src={toResizedImageUrl(cover, 64)}
                    alt=""
                    width={32}
                    height={32}
                    decoding="async"
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="size-8 shrink-0 rounded-full bg-muted" />
                )}
                {t(item.label[0], item.label[1])}
                <span className="hidden font-normal text-xs opacity-75 sm:inline">
                  {t(item.subLabel[0], item.subLabel[1])}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function GenreTastes(props: {
  genre: GenreConfig
  tastes: GenreWorksData["tastes"]
  trendingTags: GenreWorksData["trendingTags"]
  toPath: (path: string) => string
}) {
  const t = useTranslation()
  const { genre } = props

  return (
    <GenreSection
      id="genre-tastes"
      icon={<HashIcon className="size-5 text-sky-500" />}
      title={t(genre.tastesTitle[0], genre.tastesTitle[1])}
      lead={t(genre.tastesLead[0], genre.tastesLead[1])}
      link={{ to: props.toPath("/tags"), label: t("タグ一覧", "All tags") }}
    >
      <ul className="grid grid-cols-2 gap-2 empty:hidden sm:grid-cols-4 md:gap-3">
        {props.tastes.map((taste, index) => {
          const description = genre.tastes[index]?.description
          return (
            <li key={taste.tag} className="min-w-0">
              <Link
                to={props.toPath(`/tags/${encodeURIComponent(taste.tag)}`)}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted lg:aspect-[16/10]"
              >
                {taste.imageUrl && (
                  <OptimizedImage
                    src={
                      toResizedImageUrl(taste.imageUrl, 320) ?? taste.imageUrl
                    }
                    srcSet={toResizedImageSrcSet(taste.imageUrl, {
                      minWidth: 160,
                    })}
                    sizes="(min-width: 640px) 25vw, 50vw"
                    alt=""
                    // 縦長の作品を横長に切り抜くので、顔が入りやすい上寄りを見せる
                    className="absolute inset-0 size-full object-cover object-[50%_15%] transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute inset-x-2.5 bottom-2 text-white">
                  <span className="block truncate font-bold text-sm md:text-base">
                    #{taste.tag}
                  </span>
                  {description && (
                    <span className="block truncate text-[11px] text-white/85 md:text-xs">
                      {t(description[0], description[1])}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {props.trendingTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-muted-foreground text-xs">
            {t(
              "今週の人気作品によく付いているタグ",
              "Tags on this week's popular works",
            )}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {props.trendingTags.map((tag) => (
              <li key={tag}>
                <Link
                  to={props.toPath(`/tags/${encodeURIComponent(tag)}`)}
                  className="inline-flex h-8 items-center rounded-full border bg-background px-3 text-xs transition-colors hover:border-foreground/40"
                >
                  <span className="mr-0.5 text-muted-foreground">#</span>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GenreSection>
  )
}

function GenreHowTo(props: {
  genre: GenreConfig
  toPath: (path: string) => string
  toSharedPath: (path: string) => string
}) {
  const t = useTranslation()
  const { genre } = props
  const text = (value: readonly [string, string]) => t(value[0], value[1])

  return (
    <section
      aria-labelledby="genre-howto-heading"
      className="relative overflow-hidden rounded-2xl border bg-card p-5 md:p-7"
    >
      <div
        className={cn(
          "-top-16 pointer-events-none absolute left-1/3 size-72 rounded-full blur-3xl",
          genre.blobs[0],
        )}
      />
      <div className="relative space-y-5">
        <div className="space-y-1">
          <h2 id="genre-howto-heading" className="font-bold text-lg md:text-xl">
            {text(genre.howToTitle)}
          </h2>
          <p className="text-muted-foreground text-sm">
            {text(genre.howToLead)}
          </p>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {genre.steps.map((step, index) => (
            <li
              key={step.title[0]}
              className="rounded-xl border bg-background/70 p-4 text-sm leading-relaxed"
            >
              <h3 className="mb-1 flex items-center gap-2 font-bold">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs">
                  {index + 1}
                </span>
                {text(step.title)}
              </h3>
              <p className="text-muted-foreground">{text(step.body)}</p>
            </li>
          ))}
        </ol>
        {genre.samplePrompts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">
            {t("プロンプトを試す", "Try a prompt")}
          </h3>
          <ul className="grid gap-2 md:grid-cols-3">
            {genre.samplePrompts.map((sample) => (
              <li key={sample.prompt} className="min-w-0">
                <Link
                  to={`${props.toSharedPath("/generation")}?prompts=${encodeURIComponent(sample.prompt)}`}
                  rel="nofollow"
                  className="group flex h-full flex-col gap-1.5 rounded-xl border bg-background/70 p-3 transition-colors hover:border-foreground/40"
                >
                  <span className="flex items-center justify-between gap-2 font-semibold text-sm">
                    {text(sample.label)}
                    <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <code className="line-clamp-2 break-words font-mono text-[11px] text-muted-foreground">
                    {sample.prompt}
                  </code>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-11 rounded-full px-5">
            <Link to={props.toSharedPath("/generation")}>
              <WandSparklesIcon className="mr-1.5 size-4" />
              {t("画像生成を開く", "Open the generator")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full bg-background/60 px-5"
          >
            <Link to={props.toPath("/new/image")}>
              <ImagePlusIcon className="mr-1.5 size-4" />
              {t("作品を投稿", "Post a work")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function GenreRelated(props: {
  genre: GenreConfig
  covers: GenreWorksData["covers"]
  toPath: (path: string) => string
}) {
  const t = useTranslation()
  const others = GENRE_KEYS.filter((key) => key !== props.genre.key)

  return (
    <section aria-labelledby="genre-related-heading" className="space-y-4">
      <h2 id="genre-related-heading" className="font-bold text-lg md:text-xl">
        {t("ほかのテイストも見る", "Explore other tastes")}
      </h2>
      <ul className="grid grid-cols-2 gap-3">
        {others.map((key) => {
          const item = toGenreConfig(key, props.genre.isSensitive)
          const cover = props.covers[key]
          return (
            <li key={key} className="min-w-0">
              <Link
                to={props.toPath(item.path)}
                className="group relative block aspect-[16/9] overflow-hidden rounded-xl bg-muted md:aspect-[3/1]"
              >
                {cover && (
                  <OptimizedImage
                    src={toResizedImageUrl(cover, 640) ?? cover}
                    srcSet={toResizedImageSrcSet(cover, { minWidth: 240 })}
                    sizes="(min-width: 768px) 40vw, 50vw"
                    alt=""
                    className="absolute inset-0 size-full object-cover object-[50%_15%] transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
                <span className="absolute bottom-2.5 left-3 text-white">
                  <span className="block font-bold text-lg md:text-2xl">
                    {t(item.label[0], item.label[1])}
                  </span>
                  <span className="block text-white/85 text-xs">
                    {t(item.subLabel[0], item.subLabel[1])}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
