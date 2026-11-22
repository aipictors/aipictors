import { Button } from "~/components/ui/button"
import { Link } from "~/lib/app/locale-router"

type Props = {
  name: string
  iconImageURL: string | null
  login: string
  onClick(): void
}

export function MutedUser(props: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs">
      <Link
        className="flex min-w-0 flex-1 items-center gap-3"
        to={`/users/${props.login}`}
      >
        <img
          src={props.iconImageURL ?? undefined}
          alt={props.name}
          className="size-10 shrink-0 rounded-full bg-muted object-cover"
        />
        <span className="min-w-0">
          <span className="block truncate font-medium text-sm">
            {props.name}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            @{props.login}
          </span>
        </span>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 rounded-full"
        onClick={props.onClick}
      >
        {"ミュート解除"}
      </Button>
    </div>
  )
}
