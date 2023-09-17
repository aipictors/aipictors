import { Box, Image } from "@chakra-ui/react"
import { FC } from "react"

type Props = {
  imageURL?: string
}

export const CardWork: FC<Props> = (props) => {
  return (
    <Box>
      <Image
        w={"100%"}
        h={"100%"}
        objectFit={"cover"}
        borderRadius={"md"}
        alt={""}
        src={props.imageURL}
      />
    </Box>
  )
}
