import { Link, useLocation } from "@remix-run/react"
import { SnsIconLink } from "~/components/sns-icon"
import { cn } from "~/lib/utils"

/**
 * フッター
 */
export function HomeFooter(): React.ReactNode {
  const location = useLocation()
  const isSensitive = /\/r($|\/)/.test(location.pathname)
  const createLink = (path: string) => {
    if (!isSensitive) {
      return path
    }

    if (path === "/") {
      return "/r"
    }

    // /r 側に対応している主要ページのみ /r プレフィックスを付ける
    const sensitiveSupportedPrefixes = [
      "/posts",
      "/models",
      "/rankings",
      "/tags",
      "/themes",
      "/collections",
      "/users",
    ]

    return sensitiveSupportedPrefixes.some((prefix) => path.startsWith(prefix))
      ? `/r${path}`
      : path
  }

  return (
    <footer className={cn("border-t", "py-12")}>
      <div className="container max-w-none">
        <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <div className="space-y-3">
              <Link
                to={createLink("/")}
                className="inline-flex items-center gap-x-2"
              >
                <img src="/icon.svg" alt="Aipictors" className="h-8 w-auto" />
                <span className="font-bold text-lg">Aipictors</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                {
                  "AipictorsはAIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。"
                }
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {"コンテンツ"}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link
                className="hover:text-foreground"
                to={createLink("/posts/2d")}
              >
                {"AIイラスト"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/posts/3d")}
              >
                {"AIフォト"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/themes")}
              >
                {"テーマ"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/models")}
              >
                {"AIモデル"}
              </Link>
              <Link className="hover:text-foreground" to={createLink("/tags")}>
                {"タグ"}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">{"検索"}</p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/search">
                {"作品を検索"}
              </Link>
              <Link className="hover:text-foreground" to={createLink("/tags")}>
                {"タグをさがす"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/models")}
              >
                {"AIモデルをさがす"}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {"ランキング"}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings")}
              >
                {"ランキング（作品）"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings?type=users")}
              >
                {"ランキング（ユーザー）"}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings")}
              >
                {"ランキング一覧"}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {"投稿企画・コンテスト"}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/events/posts">
                {"企画・コンテスト一覧"}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/events/posts?status=ONGOING"
              >
                {"開催中の企画"}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/events/posts?status=UPCOMING"
              >
                {"開催予定の企画"}
              </Link>
              <Link className="hover:text-foreground" to="/events/user-events">
                {"ユーザー主催投稿企画一覧"}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {"サイトについて"}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/about">
                {"Aipictorsとは"}
              </Link>
              <Link className="hover:text-foreground" to="/roadmap">
                {"ロードマップ"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col gap-y-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-x-2">
              <SnsIconLink
                url="https://x.com/AIPICTORS"
                variant="plain"
                ariaLabel="X"
              />
              <SnsIconLink
                url="https://discord.gg/7jA2MmtvtR"
                variant="plain"
                ariaLabel="Discord"
              />
              <SnsIconLink
                url="https://www.instagram.com/aipictors"
                variant="plain"
                ariaLabel="Instagram"
              />
              <SnsIconLink
                url="https://github.com/aipictors"
                variant="plain"
                ariaLabel="GitHub"
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/terms">
                {"利用規約"}
              </Link>
              <Link className="hover:text-foreground" to="/privacy">
                {"個人情報保護方針"}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/specified-commercial-transaction-act"
              >
                {"特定商取引法に基づく表記"}
              </Link>
              <Link className="hover:text-foreground" to="/guideline">
                {"コインの利用に関するガイドライン"}
              </Link>
              <Link className="hover:text-foreground" to="/help">
                {"FAQ"}
              </Link>
              <Link className="hover:text-foreground" to="/contact">
                {"お問い合わせ"}
              </Link>
              <Link className="hover:text-foreground" to="/presskit">
                {"広告掲載"}
              </Link>
              <Link
                className="hover:text-foreground"
                to="https://www.aipictors.com/company/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"運営会社"}
              </Link>
            </div>

            <p className="text-muted-foreground text-sm">{"© Aipictors"}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
