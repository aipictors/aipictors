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
import { useState } from "react"
import { TbPlus } from "react-icons/tb"

export const AccountProfileForm: React.FC = () => {
  const [userName, setUserName] = useState("")

  const [userProfile, setUserProfile] = useState("")

  const [userProfileEn, setUserProfileEn] = useState("")

  const [userTwitter, setUserTwitter] = useState("")

  const [userInstagram, setUserInstagram] = useState("")

  const [userGitHub, setUserGitHub] = useState("")

  const [userHomePage, setUserHomePage] = useState("")

  const [userMail, setUserMail] = useState("")

  return (
    <Stack w={"100%"} spacing={8}>
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
          <Input
            placeholder="ユーザ名"
            value={userName}
            onChange={(event) => {
              setUserName(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"プロフィール"}</Text>
          <Input
            placeholder="プロフィール"
            value={userProfile}
            onChange={(event) => {
              setUserProfile(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"英語環境向けプロフィール"}</Text>
          <Input
            placeholder="プロフィール"
            value={userProfileEn}
            onChange={(event) => {
              setUserProfileEn(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"Twitter"}</Text>
          <Input
            placeholder="ユーザID"
            value={userTwitter}
            onChange={(event) => {
              setUserTwitter(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"Instagram"}</Text>
          <Input
            placeholder="ユーザID"
            value={userInstagram}
            onChange={(event) => {
              setUserInstagram(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"GitHub"}</Text>
          <Input
            placeholder="ユーザID"
            value={userGitHub}
            onChange={(event) => {
              setUserGitHub(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"ホームページ"}</Text>
          <Input
            placeholder="URL"
            value={userHomePage}
            onChange={(event) => {
              setUserHomePage(event.target.value)
            }}
          />
        </Stack>
        <Stack>
          <Text>{"メール"}</Text>
          <Input
            placeholder="メールアドレス"
            value={userMail}
            onChange={(event) => {
              setUserMail(event.target.value)
            }}
          />
        </Stack>
      </Stack>
      <Button colorScheme="primary" borderRadius={"full"} onClick={() => {}}>
        {"変更を保存"}
      </Button>
    </Stack>
  )
}
