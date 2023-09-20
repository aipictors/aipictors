"use client"
import { Box, Stack, Text, useBreakpoint } from "@chakra-ui/react"
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
import { HomeNavigationButton } from "app/(main)/components/HomeNavigationButton"

export const SettingsNavigation: React.FC = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint === "base" || breakpoint === "sm") {
    return null
  }

  return (
    <Box
      as={"aside"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 64px)"}
      minW={"12rem"}
      overflowY={"auto"}
    >
      <Stack py={4} pr={4}>
        <Box pl={3}>
          <Text fontWeight={"bold"}>{"設定"}</Text>
        </Box>
        <HomeNavigationButton href={"/settings/login"} leftIcon={TbMoodSmile}>
          {"ユーザID"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/password"} leftIcon={TbLock}>
          {"パスワード"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/profile"} leftIcon={TbUser}>
          {"プロフィール"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/notification"} leftIcon={TbBell}>
          {"通知・いいね"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/contents"} leftIcon={TbPhoto}>
          {"表示コンテンツ"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/settings/mute/users"}
          leftIcon={TbUserOff}
        >
          {"ユーザミュート"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/mute/tags"} leftIcon={TbTagsOff}>
          {"タグミュート"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/settings/stickers"}
          leftIcon={TbRubberStamp}
        >
          {"作成スタンプ"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/settings/stickers/downloads"}
          leftIcon={TbDownload}
        >
          {"DLスタンプ"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/request"} leftIcon={TbMedal2}>
          {"支援リクエスト"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/settings/interface"}
          leftIcon={TbSettings}
        >
          {"UIカスタム"}
        </HomeNavigationButton>
      </Stack>
    </Box>
  )
}
