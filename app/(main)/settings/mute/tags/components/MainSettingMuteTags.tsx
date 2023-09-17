"use client"
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { FC} from "react";
import { useState } from "react"
import { TbTrash } from "react-icons/tb"

export const MainSettingMuteTags: FC = () => {
  const [count, setCount] = useState(0)

  const onClick = () => {}

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ミュートしているタグ"}
        </Text>
        <Stack>
          <Input
            onChange={(e) => {
              setCount(e.target.value.length)
            }}
            placeholder="タグ"
          />
          <HStack justifyContent={"flex-end"}>
            <Text fontSize={"xs"}>{`${count}/12`}</Text>
          </HStack>
        </Stack>
        <Stack>
          <Box>
            <Text>{"ミュートしているタグはありません"}</Text>
          </Box>
        </Stack>
        <Stack divider={<Divider />}>
          <HStack justifyContent={"space-between"}>
            <Box>
              <Text>{"プロンプトン"}</Text>
            </Box>
            <IconButton
              aria-label="DeleteMuteTags"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <Box>
              <Text>{"プロンプトン"}</Text>
            </Box>
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <Box>
              <Text>{"プロンプトン"}</Text>
            </Box>
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbTrash} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
          </HStack>
        </Stack>
        <HStack justifyContent={"flex-end"}>
          <Button colorScheme="primary" borderRadius={"full"} onClick={onClick}>
            {"変更を保存"}
          </Button>
        </HStack>
      </Stack>
    </HStack>
  )
}
