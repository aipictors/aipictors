import { HeartIcon } from "lucide-react"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Switch } from "~/components/ui/switch"
import { useListLikeCountHidden } from "~/hooks/use-list-like-count-hidden"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  className?: string
  iconClassName?: string
}

/**
 * メニューに置く「一覧のいいね数」の切り替え
 */
export function ListLikeCountMenuItem(props: Props) {
  const t = useTranslation()

  const [isHidden, setIsHidden] = useListLikeCountHidden()

  return (
    <DropdownMenuItem
      className={cn("cursor-pointer gap-0", props.className)}
      // 切り替えた結果を後ろの一覧で見られるよう、メニューは閉じない
      onSelect={(event) => {
        event.preventDefault()
        setIsHidden(!isHidden)
      }}
    >
      <HeartIcon className={props.iconClassName} />
      <span className="text-sm">
        {t("一覧のいいね数", "Like counts in lists")}
      </span>
      <Switch
        aria-label={t("一覧のいいね数を表示する", "Show like counts in lists")}
        checked={!isHidden}
        tabIndex={-1}
        className="pointer-events-none ml-auto scale-75"
      />
    </DropdownMenuItem>
  )
}
