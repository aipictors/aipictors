import { ChevronRightIcon, LightbulbIcon, WandSparklesIcon } from "lucide-react"
import { useContext } from "react"
import type { Thing, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import type { GuideArticle, GuideBlock } from "~/lib/guides/guide-articles"
import { GUIDE_SUMMARIES } from "~/lib/guides/guide-summaries"

function Block(props: { block: GuideBlock }) {
  const { block } = props
  switch (block.type) {
    case "h2":
      return <h2 className="pt-6 font-bold text-xl md:text-2xl">{block.text}</h2>
    case "p":
      return <p className="leading-relaxed">{block.text}</p>
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul"
      return (
        <ListTag
          className={
            block.ordered
              ? "list-decimal space-y-1.5 pl-6 leading-relaxed"
              : "list-disc space-y-1.5 pl-6 leading-relaxed"
          }
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      )
    }
    case "code":
      return (
        <figure className="space-y-1">
          {block.caption && (
            <figcaption className="text-muted-foreground text-xs">
              {block.caption}
            </figcaption>
          )}
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-4 font-mono text-sm">
            {block.text}
          </pre>
        </figure>
      )
    case "tip":
      return (
        <p className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
          <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>{block.text}</span>
        </p>
      )
    case "links":
      return (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          {block.title && <p className="font-semibold text-sm">{block.title}</p>}
          <ul className="flex flex-wrap gap-2">
            {block.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:border-foreground/40"
                >
                  {item.label}
                  <ChevronRightIcon className="ml-0.5 size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )
  }
}

/**
 * 解説記事（/guides/:slug）。日本語のみ
 */
export function GuideArticleView(props: { article: GuideArticle }) {
  const { article } = props
  const authContext = useContext(AuthContext)
  const url = `${config.siteURL}/guides/${article.slug}`
  const jsonLd: Array<WithContext<Thing>> = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      inLanguage: "ja",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Aipictors", url: config.siteURL },
      publisher: {
        "@type": "Organization",
        name: "Aipictors",
        url: config.siteURL,
      },
      image: config.defaultOgpImageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Aipictors", item: config.siteURL },
        {
          "@type": "ListItem",
          position: 2,
          name: "AIイラストの作り方ガイド",
          item: `${config.siteURL}/guides`,
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ]
  const others = GUIDE_SUMMARIES.filter((guide) => guide.slug !== article.slug)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12" lang="ja">
      <AppJsonLdScript jsonLd={jsonLd} />
      <nav
        aria-label="パンくずリスト"
        className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground">
          ホーム
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <Link to="/guides" className="hover:text-foreground">
          作り方ガイド
        </Link>
      </nav>
      <header className="space-y-2">
        <h1 className="font-bold text-2xl leading-tight tracking-tight md:text-3xl">
          {article.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          更新日 <time dateTime={article.updatedAt}>{article.updatedAt}</time>
        </p>
      </header>
      <article className="flex flex-col gap-4 text-[15px] md:text-base">
        {article.blocks.map((block, index) => (
          // 本文は固定の内容で並び替えないので、位置をキーにする
          // biome-ignore lint/suspicious/noArrayIndexKey: 固定の本文
          <Block key={index} block={block} />
        ))}
      </article>

      <aside className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-sky-500/5 to-violet-500/10 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm">
          {authContext.isLoggedIn
            ? "読んだ内容は、生成画面ですぐに試せます。"
            : "Aipictors は無料のアカウントで毎日 AI 画像を生成でき、そのまま投稿もできます。"}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link to="/generation" rel="nofollow">
              <WandSparklesIcon className="mr-1 size-4" />
              生成してみる
            </Link>
          </Button>
          {!authContext.isLoggedIn && !authContext.isLoading && (
            <LoginDialogButton
              variant="outline"
              className="rounded-full"
              label="無料で登録・ログイン"
            />
          )}
        </div>
      </aside>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">ほかのガイド</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {others.map((guide) => (
            <li key={guide.slug}>
              <Link
                to={`/guides/${guide.slug}`}
                className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 hover:border-foreground/40"
              >
                <span className="font-semibold text-sm">{guide.title}</span>
                <span className="text-muted-foreground text-xs">
                  {guide.description}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/prompts"
              className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 hover:border-foreground/40"
            >
              <span className="font-semibold text-sm">
                AIイラストの呪文（プロンプト）まとめ
              </span>
              <span className="text-muted-foreground text-xs">
                キャラクター・タグ・モデルごとに、人気作品の呪文を集計
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
