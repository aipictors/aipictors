"use client"
import { HStack, Stack, Text } from "@chakra-ui/react"
import type { ImageModelQuery } from "__generated__/apollo"

type Props = {
  imageModelQuery: ImageModelQuery
}

export const MainModel: React.FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {props.imageModelQuery.imageModel.name}
        </Text>
      </Stack>
    </HStack>
  )
}
