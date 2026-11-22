import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  userId: string
  name: string
  login: string
  iconImageURL: string
  onClick(): void
}

export function BlockedUser(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs">
      <Link
        to={`/users/${props.login}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar>
          <AvatarImage src={props.iconImageURL} alt={props.name} />
          <AvatarFallback />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{props.name}</p>
          <p className="truncate text-muted-foreground text-xs">
            @{props.login}
          </p>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 rounded-full"
        onClick={props.onClick}
      >
        {t("ブロック解除", "Unblock")}
      </Button>
    </div>
  )
}
