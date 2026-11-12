import { useLocation } from "@remix-run/react"
import { ImagesIcon, WandSparklesIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { getPathLocale } from "~/utils/locale-path"

/**
 * はじめて来た人に、何のサイトかと最初にできることを伝える（ログインしていない人だけ）
 * 英語のページには専用の入口（HomeEnglishHero）があるので出さない。
 * 出す・隠すは html の data-aip-auth（描画前に head のスクリプトが入れる）で切り替える。
 * ログインの確認を待ってから消すと、ログイン中の人の画面が毎回ずれるため
 */
export function HomeGuestHero() {
  const { pathname } = useLocation()
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  if (getPathLocale(pathname) === "en" || authContext.isLoggedIn) {
    return null
  }

  const points = [
    { value: t("毎日10枚", "10 a day"), label: t("無料で生成", "free images") },
    { value: t("70万+", "700K+"), label: t("投稿作品", "works") },
    { value: t("20万+", "200K+"), label: t("登録ユーザー", "members") },
  ]

  return (
    <section className="hidden overflow-hidden rounded-2xl border bg-linear-to-br from-sky-500/10 via-violet-500/10 to-pink-500/10 px-4 py-4 md:items-center md:justify-between md:gap-6 md:px-7 md:py-6 [html[data-aip-auth=out]_&]:block md:[html[data-aip-auth=out]_&]:flex">
      <div className="min-w-0">
        <p className="font-semibold text-violet-600 text-xs md:text-sm dark:text-violet-300">
          {t(
            "AIイラスト・AI画像の投稿＆生成サイト",
            "AI illustration posting & generation site",
          )}
        </p>
        <h2 className="mt-1 font-extrabold text-lg leading-snug tracking-tight min-[400px]:text-xl md:text-3xl">
          {/* 幅が足りないときは読点のあとで折り返す */}
          <span className="inline-block">
            {t("AIイラストを、", "See, make and ")}
          </span>
          <span className="inline-block">
            {t("見る・つくる・投稿する", "share AI art")}
          </span>
        </h2>
        <p className="mt-2 hidden max-w-xl text-muted-foreground text-sm leading-relaxed md:block">
          {t(
            "プロンプト付きの作品を眺めて、気に入った設定でそのまま生成。登録は無料です。",
            "Browse works with their prompts and generate with the settings you like. Signing up is free.",
          )}
        </p>
        <div className="mt-3 flex gap-2 md:mt-4">
          <Button
            asChild
            className="flex-1 gap-1.5 rounded-full px-2 font-bold md:flex-none md:px-6"
          >
            <Link to="/generation">
              <WandSparklesIcon className="size-4" />
              {t("無料で生成する", "Generate for free")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 gap-1.5 rounded-full bg-background/70 px-2 font-bold md:flex-none md:px-6"
          >
            <Link to="/rankings">
              <ImagesIcon className="size-4" />
              {t("人気の作品を見る", "See popular works")}
            </Link>
          </Button>
        </div>
      </div>
      {/* スマホでは 1 行にまとめて、作品が最初の画面に入るようにする */}
      <ul className="mt-3 flex shrink-0 flex-wrap justify-between gap-x-3 gap-y-1 md:mt-0 md:grid md:w-[22rem] md:grid-cols-3 md:gap-2">
        {points.map((point) => (
          <li
            key={point.label}
            className="flex items-baseline gap-1 md:block md:rounded-xl md:border md:bg-background/70 md:px-1 md:py-3 md:text-center"
          >
            <p className="font-extrabold text-xs md:text-xl">{point.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight md:text-xs">
              {point.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
