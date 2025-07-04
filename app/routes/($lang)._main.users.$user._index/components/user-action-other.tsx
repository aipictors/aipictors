import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { EllipsisIcon } from "lucide-react"
import { UserMuteButton } from "~/routes/($lang)._main.users.$user._index/components/user-mute-button"
import { UserBlockButton } from "./user-block-button"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"

type Props = {
  id: string
  isMuted: boolean
  isBlocked?: boolean
}

export function UserActionOther(props: Props) {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === props.id
  ) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <EllipsisIcon className="w-16" />
        </Button>
      </PopoverTrigger>
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
