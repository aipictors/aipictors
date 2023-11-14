"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { Config } from "@/config"
import { Bell, BookmarkX, Image, Medal, Settings, UserX } from "lucide-react"

export const SettingsRouteList = () => {
  return (
    <div className="space-y-1">
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/notification"}
        leftIcon={<Bell />}
      >
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/restriction"}
        leftIcon={<Image />}
      >
        {"表示コンテンツ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} leftIcon={<UserX />}>
        {"ユーザミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/settings/muted/tags"}
        leftIcon={<BookmarkX />}
      >
        {"タグミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/request"}
        leftIcon={<Medal />}
      >
        {"支援リクエスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/interface"}
        leftIcon={<Settings />}
      >
        {"UIカスタム"}
      </HomeNavigationButton>
    </div>
  )
}
