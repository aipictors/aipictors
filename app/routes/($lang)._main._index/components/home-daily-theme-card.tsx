import { ChevronRightIcon, LightbulbIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * 今日のお題（アプリのホームと同じカード）
 */
export function HomeDailyThemeCard(props: {
  theme: {
    title: string
    enTitle?: string | null
    worksCount?: number | null
    year: number
    month: number
    day: number
    firstWork?: { smallThumbnailImageURL: string } | null
  }
}) {
  const t = useTranslation()
  const { theme } = props
  const title = t(theme.title, theme.enTitle || theme.title)
  const imageUrl = theme.firstWork?.smallThumbnailImageURL
  return (
    <Link
      to={`/themes/${theme.year}/${theme.month}/${theme.day}`}
      className="flex h-[92px] items-center overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FFE7B0] to-[#FFC2D4] transition-transform active:scale-[0.98] motion-reduce:transform-none dark:from-[#5A3E12] dark:to-[#5A2338]"
    >
      <div className="min-w-0 flex-1 space-y-0.5 px-4">
        <p className="flex items-center gap-1 font-extrabold text-[#8A4B00] text-xs dark:text-[#FFD48A]">
          <LightbulbIcon className="size-3.5" />
          {t("今日のお題", "Today's theme")}
        </p>
        <p className="truncate font-black text-[#2B1A00] text-xl leading-tight dark:text-white">
          {title}
        </p>
        <p className="truncate text-[#6B4A1F] text-xs dark:text-white/75">
          {(theme.worksCount ?? 0) > 0
            ? t(
                `${theme.worksCount}作品が参加中・参加してみよう`,
                `${theme.worksCount} works so far — join in`,
              )
            : t("参加してみよう", "Join in")}
        </p>
      </div>
      {imageUrl ? (
        <img
          src={toResizedImageUrl(imageUrl, 240) ?? imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-[92px] shrink-0 object-cover"
        />
      ) : (
        <ChevronRightIcon className="mr-4 size-5 shrink-0 text-[#8A4B00]/70" />
      )}
    </Link>
  )
}
