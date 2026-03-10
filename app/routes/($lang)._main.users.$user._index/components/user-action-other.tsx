import { EllipsisIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { UserMuteButton } from "~/routes/($lang)._main.users.$user._index/components/user-mute-button"
import { UserBlockButton } from "./user-block-button"

type Props = {
  id: string
  isMuted: boolean
  isBlocked?: boolean
}

export function UserActionOther(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === props.id
  ) {
    return null
  }

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size={"icon"}
                variant="secondary"
                aria-label={t("その他", "More")}
                title={t("その他", "More")}
              >
                <EllipsisIcon className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("その他", "More")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">{t("ミュート", "Mute")}</p>
              <p className="text-muted-foreground text-xs leading-5">
                {t(
                  "自分の画面だけで相手を見えにくくします。検索結果・タグ経由の作品一覧・コメント欄のスタンプやコメント・スタンプ広場などから非表示にしやすくなります。相手には通知されず、交流制限はしません。",
                  "Hide the user only on your side. Their works, stamps, and comments are easier to hide from search results, tag-based lists, comment areas, and the sticker plaza. The other user is not notified and interactions are not restricted.",
                )}
              </p>
            </div>
            <UserMuteButton
              id={props.id}
              isMuted={props.isMuted}
              variant="secondary"
            />
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">{t("ブロック", "Block")}</p>
              <p className="text-muted-foreground text-xs leading-5">
                {t(
                  "お互いの表示や反応を強く制限したい場合はこちらです。相手の作品やプロフィールを見かけにくくなり、いいね・コメントなどの交流も制限されます。",
                  "Use this when you want stronger mutual restrictions. The other user's works and profile become harder to see, and interactions such as likes and comments are restricted.",
                )}
              </p>
            </div>
            <UserBlockButton
              id={props.id}
              isBlocked={props.isBlocked ?? false}
              variant="secondary"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
