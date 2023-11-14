"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { Stack } from "@chakra-ui/react"
import { LockKeyhole, Smile, User } from "lucide-react"

export const AccountRouteList = () => {
  return (
    <Stack>
      <HomeNavigationButton href={"/account/login"} leftIcon={<Smile />}>
        {"ユーザID"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/account/password"}
        leftIcon={<LockKeyhole />}
      >
        {"パスワード"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={true}
        href={"/account/profile"}
        leftIcon={<User />}
      >
        {"プロフィール"}
      </HomeNavigationButton>
    </Stack>
  )
}
