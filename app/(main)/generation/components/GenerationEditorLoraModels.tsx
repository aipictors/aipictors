"use client"

import {
  Button,
  Card,
  HStack,
  Progress,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"

export const GenerationEditorLoraModels = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack>
        <Text fontWeight={"bold"}>{"LoRA"}</Text>
        <HStack spacing={4}>
          <Skeleton height={20} width={20} />
          <Stack>
            <Text fontSize={"xs"}>{"フラットな絵になります２"}</Text>
            <Progress value={20} size="xs" colorScheme="pink" w={44} />
          </Stack>
        </HStack>
        <HStack spacing={4}>
          <Skeleton height={20} width={20} />
          <Stack>
            <Text fontSize={"xs"}>{"髪がより細かく描き込まれます"}</Text>
            <Progress value={20} size="xs" colorScheme="pink" w={44} />
          </Stack>
        </HStack>
        <Button borderRadius={"full"}>{"もっとLoRAを表示する"}</Button>
        <Text fontWeight={"bold"}>{"サイズ"}</Text>
        <Text fontWeight={"bold"}>{"VAE"}</Text>
        <Text fontWeight={"bold"}>{"Seed"}</Text>
      </Stack>
    </Card>
  )
}
