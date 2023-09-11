"use client"
import {
  Avatar,
  Button,
  HStack,
  Icon,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FC } from "react"
import { TbPlus } from "react-icons/tb"

export const MainSettingProfile: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"プロフィール"}
        </Text>
        <HStack>
          <Button
            aria-label="Search database"
            rightIcon={<Icon as={TbPlus} />}
            borderRadius={"full"}
          >
            {"ヘッダー追加ボタン"}
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Avatar bg="teal.500" size={"md"} />
          <Button borderRadius={"full"}>{"アイコン追加ボタン"}</Button>
        </HStack>
        <Stack spacing={4}>
          <Stack>
            <Text>{"ユーザ名"}</Text>
            <Input placeholder="ユーザ名" />
          </Stack>
          <Stack>
            <Text>{"プロフィール"}</Text>
            <Input placeholder="プロフィール" />
          </Stack>
          <Stack>
            <Text>{"英語環境向けプロフィール"}</Text>
            <Input placeholder="プロフィール" />
          </Stack>

          <Stack>
            <Text>{"Twitter"}</Text>
            <Input placeholder="ユーザID" />
          </Stack>
          <Stack>
            <Text>{"Instagram"}</Text>
            <Input placeholder="ユーザID" />
          </Stack>
          <Stack>
            <Text>{"GitHub"}</Text>
            <Input placeholder="ユーザID" />
          </Stack>
          <Stack>
            <Text>{"ホームページ"}</Text>
            <Input placeholder="URL" />
          </Stack>
          <Stack>
            <Text>{"メール"}</Text>
            <Input placeholder="メールアドレス" />
          </Stack>
        </Stack>

        <Button colorScheme="primary" borderRadius={"full"}>
          {"変更を保存"}
        </Button>
      </Stack>
    </HStack>
  )
}
