import { Image } from "@chakra-ui/react"

type Props = {
  imageURL?: string
}

export const WorkCard = (props: Props) => {
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
