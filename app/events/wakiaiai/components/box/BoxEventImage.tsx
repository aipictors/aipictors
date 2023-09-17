import type { ImageProps } from "@chakra-ui/react";
import { Image, Box, Icon, Button } from "@chakra-ui/react"
import type { FC } from "react"
import { TbClick } from "react-icons/tb"

type Props = ImageProps & {
  alt: string
  imageURL: string
  linkURL: string
  linkTitle: string
}

export const BoxEventImage: FC<Props> = (props) => {
  return (
    <Box position={"relative"}>
      <Image
        alt={props.alt}
        borderTopRadius={"md"}
        borderBottomLeftRadius={"md"}
        borderBottomRightRadius={"3xl"}
        w={"100%"}
        objectFit={"cover"}
        objectPosition={"top"}
        src={props.imageURL}
      />
      <Button
        as={"a"}
        href={props.linkURL}
        target={"_blank"}
        rel={"noopener"}
        position={"absolute"}
        bottom={4}
        right={4}
        variant={"outline"}
        colorScheme={"blue"}
        lineHeight={1}
        borderRadius={"full"}
        leftIcon={<Icon as={TbClick} />}
      >
        {props.linkTitle}
      </Button>
    </Box>
  )
}
