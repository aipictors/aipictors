import { Link } from "@remix-run/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

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
    <div className="flex items-center space-x-4 rounded-md border p-4">
      <Link
        to={`/users/${props.login}`}
        className="flex w-full items-center space-x-4"
      >
        <Avatar>
          <AvatarImage src={props.iconImageURL} alt={props.name} />
          <AvatarFallback />
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{props.name}</p>
          <p className="text-muted-foreground text-sm">@{props.login}</p>
        </div>
      </Link>
      <Button variant="outline" size="sm" onClick={props.onClick}>
        {t("ブロック解除", "Unblock")}
      </Button>
    </div>
  )
}
