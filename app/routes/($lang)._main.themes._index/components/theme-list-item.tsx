import { Button } from "@/components/ui/button"
import { Link } from "@remix-run/react"

type Props = {
  year: number
  month: number
  day: number | null
  title: string | null
}

export const ThemeListItem = (props: Props) => {
  if (props.title === null) {
    return <div className="hidden rounded bg-[backgroundColor] p-4 lg:block" />
  }

  return (
    <Link to={`/themes/${props.year}/${props.month}/${props.day}`}>
      <Button>
        <span className="block w-auto text-sm">{props.day}</span>
        <span className="block w-auto overflow-hidden truncate whitespace-pre-wrap text-sm">
          {props.title}
        </span>
      </Button>
    </Link>
  )
}
