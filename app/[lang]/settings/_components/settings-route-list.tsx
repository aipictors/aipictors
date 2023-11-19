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
        icon={Bell}
      >
        {"通知・いいね"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/restriction"}
        icon={Image}
      >
        {"表示コンテンツ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} icon={UserX}>
        {"ユーザミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} icon={BookmarkX}>
        {"タグミュート"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/request"}
        icon={Medal}
      >
        {"支援リクエスト"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/settings/interface"}
        icon={Settings}
      >
        {"UIカスタム"}
      </HomeNavigationButton>
    </div>
  )
}
