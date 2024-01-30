import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  name: string
}

export const TagButton = (props: Props) => {
  return (
    <Link href={`/tags/${props.name}`}>
      <Button variant={"link"}>#{props.name}</Button>
    </Link>
  )
}
