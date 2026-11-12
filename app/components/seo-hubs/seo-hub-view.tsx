import { useLocation } from "@remix-run/react"
import {
  BookOpenIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  CpuIcon,
  HashIcon,
  SparklesIcon,
  UserRoundIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import type { Thing, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { GUIDE_SUMMARIES } from "~/lib/guides/guide-summaries"
import type { SeoHubData } from "~/lib/seo-hubs/seo-hub-data.server"
import { buildHubIntro, buildHubTitle } from "~/lib/seo-hubs/seo-hub-text"
import { cn } from "~/lib/utils"
import { getPathLocale } from "~/utils/locale-path"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type Props = { data: SeoHubData }

function CopyButton(props: {
  text: string
  label: string
  className?: string
}) {
  const t = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-8 rounded-full", props.className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(props.text)
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 1500)
        } catch {
          // コピーできない環境（http や古いブラウザ）では何もしない
        }
      }}
    >
      {isCopied ? (
        <CheckIcon className="mr-1 size-3.5" />
      ) : (
        <CopyIcon className="mr-1 size-3.5" />
      )}
      {isCopied ? t("コピーしました", "Copied") : props.label}
    </Button>
  )
}

function Section(props: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section aria-labelledby={props.id} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <h2 id={props.id} className="font-bold text-xl">
            {props.title}
          </h2>
          {props.description && (
            <p className="text-muted-foreground text-sm">{props.description}</p>
          )}
        </div>
        {props.action}
      </div>
      {props.children}
    </section>
  )
}

function TokenChips(props: {
  tokens: { token: string; share: number }[]
  muted?: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {props.tokens.map((item) => (
        <li
          key={item.token}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm",
            props.muted ? "bg-muted/40 text-muted-foreground" : "bg-card",
          )}
        >
          <span>{item.token}</span>
          <span className="font-sans text-muted-foreground text-xs">
            {item.share}%
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * 登録・生成への導線（押し付けない大きさで、呪文の例の後に 1 か所だけ）
 */
function TryCard(props: { name: string; isSensitive: boolean }) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-sky-500/5 to-violet-500/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="space-y-1">
        <p className="font-semibold">
          {t(
            `${props.name}の呪文を、自分でも試してみませんか`,
            `Try these ${props.name} prompts yourself`,
          )}
        </p>
        <p className="text-muted-foreground text-sm">
          {authContext.isLoggedIn
            ? t(
                "呪文をコピーして生成画面に貼るだけで試せます。できた作品は呪文ごと投稿して共有できます。",
                "Paste a prompt into the generator to try it. You can post your results with their prompts.",
              )
            : t(
                "Aipictors は無料のアカウントで毎日 AI 画像を生成でき、そのまま投稿もできます。",
                "With a free Aipictors account you can generate AI images every day and post them.",
              )}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <Link to="/generation" rel="nofollow">
            <WandSparklesIcon className="mr-1 size-4" />
            {t("生成してみる", "Open the generator")}
          </Link>
        </Button>
        {authContext.isLoggedIn ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/new/image" rel="nofollow">
              {t("作品を投稿する", "Post a work")}
            </Link>
          </Button>
        ) : (
          !authContext.isLoading && (
            <LoginDialogButton
              variant="outline"
              className="rounded-full"
              label={t("無料で登録・ログイン", "Sign up free")}
            />
          )
        )}
      </div>
    </aside>
  )
}

/**
 * 呪文まとめ（/prompts/tags/:tag・/prompts/models/:model と /r 側）
 */
export function SeoHubView(props: Props) {
  const { data } = props
  const t = useTranslation()
  const location = useLocation()
  const locale = getPathLocale(location.pathname)
  const prefix = data.isSensitive ? "/r" : ""
  const homeUrl = locale === "en" ? `${config.siteURL}/en` : config.siteURL
  const indexPath = `${prefix}/prompts`
  const listPath =
    data.type === "model"
      ? `${prefix}/models/${encodeURIComponent(data.name)}`
      : `${prefix}/tags/${encodeURIComponent(data.name)}`
  const pagePath = `${prefix}/prompts/${data.type === "model" ? "models" : "tags"}/${encodeURIComponent(data.name)}`
  const title = buildHubTitle(data, locale)
  const intro = buildHubIntro(data, locale)
  const kindLabel =
    data.type === "model"
      ? t("モデル", "Model")
      : data.tagKind === "character"
        ? t("キャラクター", "Character")
        : data.tagKind === "series"
          ? t("作品・シリーズ", "Series")
          : t("タグ", "Tag")
  const KindIcon =
    data.type === "model"
      ? CpuIcon
      : data.tagKind === "character"
        ? UserRoundIcon
        : HashIcon
  const topTokens = data.tokens.content.slice(0, 12).map((item) => item.token)
  const cover = data.popularWorks[0]

  const jsonLd: Array<WithContext<Thing>> = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: `${homeUrl}${pagePath}`,
      inLanguage: locale,
      ...(data.isSensitive && { isFamilyFriendly: false }),
      about: {
        "@type": data.type === "model" ? "SoftwareApplication" : "Thing",
        name: data.name,
      },
      isPartOf: { "@type": "WebSite", name: "Aipictors", url: homeUrl },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: data.popularWorks.length,
        itemListElement: data.popularWorks.slice(0, 20).map((work, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${homeUrl}${prefix}/posts/${work.id}`,
          name: t.workTitle(work.title, work.enTitle),
          ...(!data.isSensitive && {
            image: work.largeThumbnailImageURL || work.smallThumbnailImageURL,
          }),
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
          item: `${homeUrl}${indexPath}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: data.name,
          item: `${homeUrl}${pagePath}`,
        },
      ],
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-12">
      <AppJsonLdScript jsonLd={jsonLd} />
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to={prefix || "/"} className="hover:text-foreground">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <Link to={indexPath} className="hover:text-foreground">
          {t("呪文まとめ", "Prompt collections")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <span className="truncate text-foreground">{data.name}</span>
      </nav>

      <header className="relative overflow-hidden rounded-2xl border bg-card">
        {cover && !data.isSensitive && (
          <img
            src={toResizedImageUrl(cover.smallThumbnailImageURL, 48)}
            alt=""
            aria-hidden
            decoding="async"
            className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-20 blur-2xl"
          />
        )}
        <div className="relative flex flex-col gap-4 p-5 md:p-7">
          <p className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
            <KindIcon className="size-3.5" />
            {kindLabel}
            <span className="mx-1">·</span>
            {t(
              `${data.worksCount.toLocaleString()}件`,
              `${data.worksCount.toLocaleString()} works`,
            )}
          </p>
          <h1 className="break-words font-bold text-2xl leading-tight tracking-tight md:text-4xl">
            {title}
          </h1>
          <div className="max-w-3xl space-y-1.5 text-muted-foreground text-sm leading-relaxed md:text-base">
            {intro.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="rounded-full">
              <Link to={listPath}>
                {t(
                  `${data.name}の作品をすべて見る`,
                  `See all ${data.name} works`,
                )}
                <ChevronRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
            {data.type === "tag" && (
              <Button asChild variant="ghost" className="rounded-full">
                <Link
                  to={`${prefix}/tags/${encodeURIComponent(data.name)}?prompt=1`}
                  rel="nofollow"
                >
                  <SparklesIcon className="mr-1 size-4" />
                  {t("呪文付きの作品だけ見る", "Only works with prompts")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {data.tokens.content.length > 0 && (
        <Section
          id="hub-tokens"
          title={t("よく使われる呪文（プロンプト）", "Common prompt words")}
          description={t(
            `呪文を公開している作品${data.promptWorksCount}件のうち、その語を使っている作品の割合です。`,
            `Share of the ${data.promptWorksCount} works with public prompts that use each word.`,
          )}
          action={
            topTokens.length > 0 && (
              <CopyButton
                text={topTokens.join(", ")}
                label={t("上位の語をコピー", "Copy top words")}
              />
            )
          }
        >
          <TokenChips tokens={data.tokens.content} />
          {data.tokens.quality.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-sm">
                {t("画質・画風の指定", "Quality and style words")}
              </h3>
              <TokenChips tokens={data.tokens.quality} muted />
            </div>
          )}
          {data.tokens.negative.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-sm">
                {t(
                  "よく使われるネガティブプロンプト",
                  "Common negative prompts",
                )}
              </h3>
              <TokenChips tokens={data.tokens.negative} muted />
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            {t(
              "語の効き方はモデルによって違います。書き方の基本は",
              "How words work depends on the model. Learn the basics in",
            )}
            <Link
              to="/guides/prompt-basics"
              className="mx-1 font-medium text-foreground underline underline-offset-2"
            >
              {t("呪文（プロンプト）の書き方", "our prompt guide")}
            </Link>
            {t("にまとめています。", ".")}
          </p>
        </Section>
      )}

      {data.examples.length > 0 && (
        <Section
          id="hub-examples"
          title={t("人気作品の呪文の例", "Example prompts from popular works")}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {data.examples.map((example) => (
              <article
                key={example.workId}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Link
                    to={`${prefix}/posts/${example.workId}`}
                    className="block size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {!data.isSensitive && (
                      <img
                        src={toResizedImageUrl(example.thumbnailUrl, 160)}
                        alt={t.workTitle(example.title, example.enTitle)}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="truncate font-semibold">
                      <Link
                        to={`${prefix}/posts/${example.workId}`}
                        className="hover:underline"
                      >
                        {t.workTitle(example.title, example.enTitle)}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {example.model && (
                        <span className="mr-2">
                          {t("モデル", "Model")}: {example.model}
                        </span>
                      )}
                      <span data-list-like-count>
                        ♥ {example.likesCount.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                  {example.prompt}
                </p>
                {example.negativePrompt && (
                  <p className="break-words text-muted-foreground text-xs">
                    <span className="font-semibold">
                      {t("ネガティブ", "Negative")}:
                    </span>{" "}
                    <span className="font-mono">{example.negativePrompt}</span>
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2">
                  <CopyButton
                    text={example.generationPrompt}
                    label={t("呪文をコピー", "Copy prompt")}
                  />
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full"
                  >
                    <Link
                      to={`/generation?prompts=${encodeURIComponent(example.generationPrompt)}`}
                      rel="nofollow"
                    >
                      <WandSparklesIcon className="mr-1 size-3.5" />
                      {t("この呪文で生成", "Generate with this")}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      <TryCard name={data.name} isSensitive={data.isSensitive} />

      {data.type === "tag" && data.models.length > 0 && (
        <Section
          id="hub-models"
          title={t("使われたモデル", "Models used")}
          description={t(
            "呪文を公開している人気作品で使われたモデルです。",
            "Models used by popular works with public prompts.",
          )}
        >
          <ul className="flex flex-wrap gap-2">
            {data.models.map((model) => (
              <li key={model.name}>
                <Link
                  to={model.path}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground/40"
                >
                  <CpuIcon className="size-3.5 text-muted-foreground" />
                  {model.name}
                  <span className="text-muted-foreground text-xs">
                    {model.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.popularWorks.length > 0 && (
        <Section
          id="hub-popular"
          title={t("人気の作品", "Popular works")}
          action={
            <Link
              to={listPath}
              className="text-muted-foreground text-sm hover:text-foreground"
            >
              {t("すべて見る", "See all")}
            </Link>
          }
        >
          <ResponsivePhotoWorksAlbum
            works={data.popularWorks}
            isShowProfile={true}
            priorityCount={2}
          />
        </Section>
      )}

      {data.latestWorks.length > 0 && (
        <Section id="hub-latest" title={t("新着の作品", "New works")}>
          <ResponsivePhotoWorksAlbum
            works={data.latestWorks}
            isShowProfile={true}
          />
        </Section>
      )}

      {data.relatedTags.length > 0 && (
        <Section
          id="hub-related"
          title={
            data.type === "model"
              ? t("このモデルでよく描かれるもの", "Popular subjects")
              : t("関連するタグ", "Related tags")
          }
        >
          <ul className="flex flex-wrap gap-2">
            {data.relatedTags.map((tag) => (
              <li key={tag.name}>
                <Link
                  to={tag.path}
                  className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground/40"
                >
                  <span className="mr-0.5 text-muted-foreground">#</span>
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {locale === "ja" && (
        <Section id="hub-guides" title="AIイラストの作り方ガイド">
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {GUIDE_SUMMARIES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 hover:border-foreground/40"
                >
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{guide.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {guide.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p className="text-center text-sm">
        <Link
          to={indexPath}
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t(
            "ほかのキャラクター・タグ・モデルの呪文まとめ",
            "More prompt collections",
          )}
        </Link>
      </p>
    </div>
  )
}
