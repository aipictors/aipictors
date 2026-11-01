import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  name: string
  iconUrl?: string | null
  level: number
  showLevel: boolean
  /** 名前の横のアイコン */
  badgeUrl: string
  /** 名前の色 */
  color: string
  className?: string
}

/**
 * Discord でどう見えるかの見本。Discord の配色に合わせる（サイトのテーマに関係なく暗い画面）
 */
export function DiscordNamePreview(props: Props) {
  const t = useTranslation()

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-[#313338] p-4 text-left text-[#dbdee1]",
        props.className,
      )}
    >
      <div className="flex gap-3">
        {props.iconUrl ? (
          <img
            src={props.iconUrl}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-full bg-[#5865f2]" />
        )}
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-5">
            <span
              className="min-w-0 break-all font-semibold text-[15px]"
              style={{ color: props.color }}
            >
              {props.name}
              {props.showLevel && ` ✦Lv.${props.level}`}
            </span>
            <img
              src={props.badgeUrl}
              alt=""
              className="size-5 shrink-0 object-contain"
            />
            <span className="text-[#949ba4] text-xs">
              {t("今日 21:04", "Today at 9:04 PM")}
            </span>
          </p>
          <p className="mt-1 text-[15px] leading-5">
            {t("新しい作品を投稿しました！", "Just posted a new piece!")}
          </p>
        </div>
      </div>
    </div>
  )
}
