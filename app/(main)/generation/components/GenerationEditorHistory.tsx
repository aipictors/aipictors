"use client"

import {
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import { TbDownload, TbStar, TbTrash } from "react-icons/tb"

export const GenerationEditorHistory = () => {
  return (
    <Card p={4} h={"100%"}>
      <Text fontWeight={"bold"}>{"生成履歴"}</Text>
      <Stack>
        <HStack>
          <Text fontWeight={"bold"}>{"全件/3日前"}</Text>
          <IconButton
            aria-label={"削除"}
            borderRadius={"full"}
            icon={<Icon as={TbTrash} />}
          />
          <IconButton
            aria-label={"ダウンロード"}
            borderRadius={"full"}
            icon={<Icon as={TbDownload} />}
          />
          <Button borderRadius={"full"}>{"解除"}</Button>
          <IconButton
            aria-label={"お気に入り"}
            borderRadius={"full"}
            icon={<Icon as={TbStar} />}
          />
        </HStack>
        <Stack>
          <SimpleGrid spacing={2} columns={3}>
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} />
          </SimpleGrid>
        </Stack>
      </Stack>
    </Card>
  )
}
