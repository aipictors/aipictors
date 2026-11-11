import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { BookOpenIcon, ChevronRightIcon } from "lucide-react"
import { config, META } from "~/config"
import { Link } from "~/lib/app/locale-router"
import { GUIDE_SUMMARIES } from "~/lib/guides/guide-summaries"
import { seoHubHeaders } from "~/lib/seo-hubs/seo-hub-route"
import { createMeta } from "~/utils/create-meta"

/**
 * 解説記事の一覧（日本語のみ）
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers = seoHubHeaders

export const meta: MetaFunction = (props) =>
  createMeta(
    { ...META.TAGS, isIndex: props.params.lang !== "en" },
    {
      title: "AIイラストの作り方ガイド｜呪文・モデル・投稿のしかた",
      enTitle: "AIイラストの作り方ガイド",
      description:
        "AIイラストの呪文（プロンプト）の書き方、ネガティブプロンプト、モデルの選び方、キャラクターを安定させるコツ、Aipictors で生成して投稿する手順をまとめた解説記事です。",
      enDescription:
        "AIイラストの呪文（プロンプト）の書き方やモデルの選び方をまとめた解説記事です。",
      url: config.defaultOgpImageUrl,
    },
    "ja",
  )

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12" lang="ja">
      <nav
        aria-label="パンくずリスト"
        className="flex items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground">
          ホーム
        </Link>
        <ChevronRightIcon className="size-3" />
        <span className="text-foreground">作り方ガイド</span>
      </nav>
      <header className="space-y-2">
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          AIイラストの作り方ガイド
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          呪文（プロンプト）の書き方やモデルの選び方など、AIイラストを作るときに知っておきたいことをまとめました。実際の作品で使われている呪文は、呪文まとめで見られます。
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {GUIDE_SUMMARIES.map((guide) => (
          <li key={guide.slug}>
            <Link
              to={`/guides/${guide.slug}`}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-foreground/40"
            >
              <BookOpenIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <span className="space-y-1">
                <span className="block font-semibold">{guide.title}</span>
                <span className="block text-muted-foreground text-sm">
                  {guide.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/prompts"
            className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-foreground/40"
          >
            <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <span className="space-y-1">
              <span className="block font-semibold">
                AIイラストの呪文（プロンプト）まとめ
              </span>
              <span className="block text-muted-foreground text-sm">
                キャラクター・タグ・モデルごとに、人気作品の呪文を集計しています
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
