"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export const AccountProfileForm = () => {
  const [userName, setUserName] = useState("")

  const [userProfile, setUserProfile] = useState("")

  const [userProfileEn, setUserProfileEn] = useState("")

  const [userTwitter, setUserTwitter] = useState("")

  const [userInstagram, setUserInstagram] = useState("")

  const [userGitHub, setUserGitHub] = useState("")

  const [userHomePage, setUserHomePage] = useState("")

  const [userMail, setUserMail] = useState("")

  return (
    <div className="w-full space-y-8">
      <div className="flex space-x-4">
        <Button aria-label="Search database">
          <Plus className="mr-2" />
          {"ヘッダー追加ボタン"}
        </Button>
      </div>
      <div className="flex space-x-4">
        <Avatar />
        <Button>{"アイコン追加ボタン"}</Button>
      </div>
      <div className="space-y-4">
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
      </div>
      <Button colorScheme="primary" borderRadius={"full"} onClick={() => {}}>
        {"変更を保存"}
      </Button>
    </div>
  )
}
