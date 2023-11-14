import { Button } from "@chakra-ui/react"
import Link from "next/link"

type Props = {
  imageURL?: string
  id: string
  name: string
}

export const TagButton = (props: Props) => {
  return (
    <Link key={props.id} href={`/tags/${props.name}`} passHref>
      <Button as={"li"} size={"sm"} minW={"fit-content"} variant={"outline"}>
        {props.name}
      </Button>
    </Link>
  )
}
