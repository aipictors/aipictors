"use client"

import { Button, HStack, Image, Text } from "@chakra-ui/react"

type Props = {
  imageURL: string
  name: string
  isSelected: boolean
  onClick(): void
}

export const SelectedModel = (props: Props) => {
  return (
    <Button
      w={"100%"}
      p={2}
      h={"auto"}
      overflow={"hidden"}
      variant={"solid"}
      colorScheme={props.isSelected ? "primary" : "gray"}
      onClick={props.onClick}
    >
      <HStack spacing={4} w={"100%"}>
        <Image
          src={props.imageURL ?? ""}
          alt={props.name}
          borderRadius={"md"}
          w={"100%"}
          draggable={false}
          maxW={16}
        />
        <Text
          wordBreak={"break-all"}
          fontSize={"sm"}
          fontWeight={"bold"}
          whiteSpace={"pre-wrap"}
        >
          {props.name}
        </Text>
      </HStack>
    </Button>
  )
}
