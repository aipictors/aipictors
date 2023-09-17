import { Image } from "@chakra-ui/react"
import type { FC } from "react"

type Props = {
  imageURL?: string
}

export const CardWork: FC<Props> = (props) => {
  return (
    <Image
      w={"100%"}
      h={"100%"}
      objectFit={"cover"}
      borderRadius={"md"}
      alt={""}
      src={props.imageURL}
    />
  )
}
