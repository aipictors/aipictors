import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { SnsIconLink } from "~/components/sns-icon"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

/**
 * フッター
 */
export function HomeFooter(): React.ReactNode {
  const location = useLocation()
  const t = useTranslation()
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
      "/popular",
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
    <footer
      className={cn(
        "border-t",
        "py-12 pb-28 md:pb-24",
        // 画面の外にある間はレイアウト・描画を省く（高さは描画するまでの仮の値）
        "[contain-intrinsic-height:auto_1000px] [content-visibility:auto]",
      )}
    >
      <div className="container max-w-none">
        <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <div className="space-y-3">
              <Link
                to={createLink("/")}
                className="inline-flex items-center gap-x-2"
              >
                <img
                  src="/icon.svg"
                  alt=""
                  className="h-8 w-auto"
                  width={41}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
                <span className="font-bold text-lg">Aipictors</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                {t(
                    "AipictorsはAIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。",
                    "Aipictors is a community for posting and discovering AI illustrations, AI photos and AI novels.",
                  )}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {t("コンテンツ", "Content")}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/posts">
                {t("すべての作品", "All works")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/posts/2d")}
              >
                {t("AIイラスト", "AI illustrations")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/posts/3d")}
              >
                {t("AIフォト", "AI photos")}
              </Link>
              <Link className="hover:text-foreground" to="/novels">
                {t("AI小説", "AI novels")}
              </Link>
              <Link className="hover:text-foreground" to="/notes">
                {t("コラム", "Columns")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/themes")}
              >
                {t("テーマ", "Themes")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/models")}
              >
                {t("AIモデル", "AI models")}
              </Link>
              <Link className="hover:text-foreground" to={createLink("/tags")}>
                {t("タグ", "Tags")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">{t("検索", "Search")}</p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/search">
                {t("作品を検索", "Search works")}
              </Link>
              <Link className="hover:text-foreground" to={createLink("/tags")}>
                {t("タグをさがす", "Browse tags")}
              </Link>
              <Link className="hover:text-foreground" to={createLink("/prompts")}>
                {t("呪文（プロンプト）まとめ", "Prompt collections")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/models")}
              >
                {t("AIモデルをさがす", "Browse AI models")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {t("ランキング", "Rankings")}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings")}
              >
                {t("ランキング（作品）", "Work rankings")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings?type=users")}
              >
                {t("ランキング（ユーザー）", "User rankings")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/rankings")}
              >
                {t("ランキング一覧", "All rankings")}
              </Link>
              <Link
                className="hover:text-foreground"
                to={createLink("/popular")}
              >
                {t("今日の人気作品", "Today's popular works")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {t("投稿企画・コンテスト", "Events & contests")}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/events/posts">
                {t("企画・コンテスト一覧", "All events & contests")}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/events/posts?status=ONGOING"
              >
                {t("開催中の企画", "Ongoing events")}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/events/posts?status=UPCOMING"
              >
                {t("開催予定の企画", "Upcoming events")}
              </Link>
              <Link className="hover:text-foreground" to="/events/user-events">
                {t("ユーザー主催投稿企画一覧", "User-hosted events")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="whitespace-nowrap font-medium text-sm">
              {t("サイトについて", "About")}
            </p>
            <div className="flex flex-col gap-y-2 text-muted-foreground text-sm">
              <Link className="hover:text-foreground" to="/about">
                {t("Aipictorsとは", "About Aipictors")}
              </Link>
              <Link className="hover:text-foreground" to="/roadmap">
                {t("ロードマップ", "Roadmap")}
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
                {t("利用規約", "Terms of Use")}
              </Link>
              <Link className="hover:text-foreground" to="/privacy">
                {t("個人情報保護方針", "Privacy Policy")}
              </Link>
              <Link
                className="hover:text-foreground"
                to="/specified-commercial-transaction-act"
              >
                {t("特定商取引法に基づく表記", "Legal Notice")}
              </Link>
              <Link className="hover:text-foreground" to="/guideline">
                {t("コインの利用に関するガイドライン", "Coin Guidelines")}
              </Link>
              <Link className="hover:text-foreground" to="/guides">
                {t("作り方ガイド", "Guides (Japanese)")}
              </Link>
              <Link className="hover:text-foreground" to="/help">
                {"FAQ"}
              </Link>
              <Link className="hover:text-foreground" to="/contact">
                {t("お問い合わせ", "Contact")}
              </Link>
              <Link className="hover:text-foreground" to="/presskit">
                {t("広告掲載", "Advertise")}
              </Link>
              <Link
                className="text-xs hover:text-foreground"
                to="https://status.aipictors.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {"Status"}
              </Link>
              <Link
                className="hover:text-foreground"
                to="https://www.aipictors.com/company/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("運営会社", "Company")}
              </Link>
            </div>

            <p className="text-muted-foreground text-sm">{"© Aipictors"}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
