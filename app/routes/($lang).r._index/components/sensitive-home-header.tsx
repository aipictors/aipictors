import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import {
  AwardIcon,
  CameraIcon,
  HistoryIcon,
  LibraryBigIcon,
  LightbulbIcon,
  PaletteIcon,
  SparklesIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { getLocalePrefix } from "~/routes/($lang)._main._index/utils/content-rating-path"
import { SensitiveDisplaySettings } from "~/routes/($lang).r._index/components/sensitive-display-settings"

type Props = {
  themeTitle: string | null
}

/**
 * R18 のトップの見出しと、はじめての人向けの案内、各ページへの入口
 */
export function SensitiveHomeHeader(props: Props): React.ReactNode {
  const t = useTranslation()
  const location = useLocation()
  const localePrefix = getLocalePrefix(location.pathname)

  const entries = [
    { to: "/r/rankings", icon: AwardIcon, label: t("ランキング", "Rankings") },
    {
      to: "/r/themes",
      icon: LightbulbIcon,
      label: props.themeTitle
        ? t(`今日のお題「${props.themeTitle}」`, `Today: ${props.themeTitle}`)
        : t("お題", "Themes"),
    },
    { to: "/r/albums", icon: LibraryBigIcon, label: t("シリーズ", "Series") },
    {
      to: "/r/posts/2d",
      icon: PaletteIcon,
      label: t("イラスト", "Illustrations"),
    },
    { to: "/r/posts/3d", icon: CameraIcon, label: t("フォト", "Photos") },
    {
      to: "/r/archive",
      icon: HistoryIcon,
      label: t("過去の名作", "Past Masterpieces"),
    },
    {
      to: "/r/ai-rankings",
      icon: SparklesIcon,
      label: t("AI評価ランキング", "AI Rankings"),
    },
  ]

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="font-bold text-xl leading-tight">
            {t("R18 AIイラスト", "R18 AI Illustrations")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "18歳以上の方向けのAIイラストの投稿コーナーです。",
              "Adult AI illustrations for people aged 18 and over.",
            )}
            <span className="hidden sm:inline">
              {t(
                "ランキングやタグから探せて、プロンプトを公開している作品もあります。",
                " Explore by ranking or tag, and see prompts where they are public.",
              )}
            </span>
          </p>
        </div>
        <SensitiveDisplaySettings />
      </div>
      <nav
        aria-label={t("R18のページ", "R18 pages")}
        className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
          {entries.map((entry) => (
            <li key={entry.to}>
              <Link
                to={`${localePrefix}${entry.to}`}
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 font-medium text-sm transition-colors hover:bg-muted"
              >
                <entry.icon className="size-4 text-muted-foreground" />
                {entry.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
