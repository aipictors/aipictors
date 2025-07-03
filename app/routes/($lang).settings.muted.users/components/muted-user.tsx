import { Link } from "react-router-dom"
import { Button } from "~/components/ui/button"

type Props = {
  name: string
  iconImageURL: string | null
  login: string
  onClick(): void
}

export function MutedUser(props: Props) {
  return (
    <div className="flex justify-between">
      <Link className="flex items-center" to={`/users/${props.login}`}>
        <div className="size-8 overflow-hidden rounded-full">
          <img
            src={props.iconImageURL ?? undefined}
            alt={props.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-2">
          <p>{props.name}</p>
        </div>
      </Link>
      <Button className="rounded-full px-4 py-2" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
