"use client"

import { Stack } from "@chakra-ui/react"
import { HomeNavigationButton } from "app/[lang]/(main)/_components/home-navigation-button"
import { Config } from "config"
import React from "react"
import {
  TbBell,
  TbMedal2,
  TbPhoto,
  TbSettings,
  TbTagsOff,
  TbUserOff,
} from "react-icons/tb"

export const SettingsRouteList: React.FC = () => {
  return (
    <Stack>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/notification"}
        leftIcon={TbBell}
      >
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/restriction"}
        leftIcon={TbPhoto}
      >
        {"表示コンテンツ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} leftIcon={TbUserOff}>
        {"ユーザミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} leftIcon={TbTagsOff}>
        {"タグミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/request"}
        leftIcon={TbMedal2}
      >
        {"支援リクエスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/interface"}
        leftIcon={TbSettings}
      >
        {"UIカスタム"}
      </HomeNavigationButton>
    </Stack>
  )
}
