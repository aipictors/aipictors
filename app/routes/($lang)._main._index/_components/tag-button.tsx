import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"

type Props = {
  name: string
}

export const TagButton = (props: Props) => {
  return (
    <Link to={`/tags/${props.name}`}>
      <Button variant={"link"}>#{props.name}</Button>
    </Link>
  )
}
