"use client"
import { Stack } from "@chakra-ui/react"
import { HomeNavigationButton } from "app/[lang]/(main)/_components/HomeNavigationButton"
import { Config } from "config"
import React from "react"
import {
  TbBell,
  TbDownload,
  TbLock,
  TbMedal2,
  TbMoodSmile,
  TbPhoto,
  TbRubberStamp,
  TbSettings,
  TbTagsOff,
  TbUser,
  TbUserOff,
} from "react-icons/tb"

export const AccountRouteList: React.FC = () => {
  return (
    <Stack>
      <HomeNavigationButton href={"/account/login"} leftIcon={TbMoodSmile}>
        {"ユーザID"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/account/password"} leftIcon={TbLock}>
        {"パスワード"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={true}
        href={"/account/profile"}
        leftIcon={TbUser}
      >
        {"プロフィール"}
      </HomeNavigationButton>
    </Stack>
  )
}
