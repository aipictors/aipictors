"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { Config } from "@/config"
import {
  BellIcon,
  BookmarkXIcon,
  ImageIcon,
  MedalIcon,
  SettingsIcon,
  UserXIcon,
} from "lucide-react"

export const SettingsRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/notification"}
        icon={BellIcon}
      >
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/restriction"}
        icon={ImageIcon}
      >
        {"表示コンテンツ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} icon={UserXIcon}>
        {"ユーザミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} icon={BookmarkXIcon}>
        {"タグミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/request"}
        icon={MedalIcon}
      >
        {"支援リクエスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/interface"}
        icon={SettingsIcon}
      >
        {"UIカスタム"}
      </HomeNavigationButton>
    </div>
  )
}
