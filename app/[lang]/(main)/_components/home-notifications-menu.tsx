"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import {
  BellIcon,
  GemIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useContext, useState } from "react"

/**
 * ヘッダーのお知らせメニュー
 * @param props
 * @returns
 */
export const HomeNotificationsMenu = () => {
  const tabValues = ["favorite", "comment", "follow", "ranking", "app"]

  const tabLabel = [
    "お気に入り",
    "コメント",
    "フォロー",
    "ランキング",
    "お知らせ",
  ]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] = useState(defaultTab) // 初期値を設定

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"} size={"icon"} aria-label={"通知"}>
          <BellIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-2 text-center font-bold opacity-80">{"通知"}</div>
        <Tabs defaultValue={defaultTab}>
          <div className="border-b">
            <TabsList className="mx-4">
              {tabValues.map((tabValue) => (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  onClick={() => handleTabClick(tabValue)}
                >
                  {tabLabel[tabValues.indexOf(tabValue)]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={activeTab}>{activeTab}</TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
