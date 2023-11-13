"use client"

import type { ImageModelQuery } from "@/__generated__/apollo"
import { HStack, Stack, Switch, Text } from "@chakra-ui/react"

type Props = {
  imageModelQuery: ImageModelQuery
}

export const ModelHeader: React.FC<Props> = (props) => {
  return (
    <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
      <HStack as={"main"} justifyContent={"center"} w={"100%"}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {`モデル「${props.imageModelQuery.imageModel?.name}」で生成された作品一覧`}
        </Text>
      </HStack>
      <HStack>
        <Text fontSize={"xs"}>{"R18作品モザイクあり"}</Text>
        <Switch size={"sm"} />
      </HStack>
      <HStack alignItems={"center"}>
        <Text fontSize={"xl"}>{"新着"}</Text>
        <Text fontSize={"xs"} color={"blue.400"}>
          {"もっと見る"}
        </Text>
      </HStack>
    </Stack>
  )
}
