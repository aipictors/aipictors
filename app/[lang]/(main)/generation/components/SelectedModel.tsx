"use client"

import { Button, Image, Text, HStack } from "@chakra-ui/react"

type Props = {
  imageURL: string
  name: string
}

export const SelectedModel: React.FC<Props> = (props) => {
  return (
    <HStack overflow={"hidden"} spacing={4}>
      <Button
        p={0}
        h={"auto"}
        overflow={"hidden"}
        variant={"outline"}
        borderWidth={2}
        borderColor={"gray.200"}
      >
        <Image
          src={props.imageURL ?? ""}
          alt={props.name}
          borderRadius={"md"}
          w={"100%"}
          maxW={32}
          draggable={false}
        />
      </Button>
      <Text fontSize={"lg"} fontWeight={"bold"} whiteSpace={"pre-wrap"}>
        {props.name}
      </Text>
    </HStack>
  )
}
