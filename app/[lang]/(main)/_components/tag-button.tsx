import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  imageURL?: string
  id: string
  name: string
}

export const TagButton = (props: Props) => {
  return (
    <Link key={props.id} href={`/tags/${props.name}`} passHref>
      <Button size={"sm"} variant={"outline"}>
        {props.name}
      </Button>
    </Link>
  )
}
