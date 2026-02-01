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
          <UserMuteButton
            id={props.id}
            isMuted={props.isMuted}
            variant="secondary"
          />
          <UserBlockButton
            id={props.id}
            isBlocked={props.isBlocked ?? false}
            variant="secondary"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
