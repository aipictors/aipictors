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
import { useState } from "react"
import { TbTrash } from "react-icons/tb"

export const MainSettingMuteTags: React.FC = () => {
  const [text, setText] = useState("")

  const onClick = () => {}

  const count = text.length

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ミュートしているタグ"}
        </Text>
        <Stack>
          <HStack alignItems={"flex-start"}>
            <Stack flex={1}>
              <Input
                borderRadius={"full"}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                }}
                placeholder="タグ"
              />
              <HStack justifyContent={"flex-end"}>
                <Text fontSize={"xs"}>{`${count}/12`}</Text>
              </HStack>
            </Stack>
            <Button
              colorScheme="primary"
              borderRadius={"full"}
              onClick={onClick}
            >
              {"変更を保存"}
            </Button>
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
      </Stack>
    </HStack>
  )
}
