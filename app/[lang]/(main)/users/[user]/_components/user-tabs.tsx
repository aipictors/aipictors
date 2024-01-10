"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

type Props = {
  userId: string
}

export const UserTabs = (props: Props) => {
  const pathname = usePathname()

  const tabPaths = [
    `/users/${props.userId}`,
    `/users/${props.userId}/novels`,
    `/users/${props.userId}/notes`,
    `/users/${props.userId}/albums`,
    `/users/${props.userId}/collections`,
    `/users/${props.userId}/stickers`,
    `/users/${props.userId}/supports`,
  ]

  const tabValues = [
    "画像",
    "小説",
    "コラム",
    "シリーズ",
    "コレクション",
    "スタンプ",
    "支援応援",
  ]

  const [activeTab, setActiveTab] = useState("画像") // 初期値を設定

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Tabs defaultValue="画像">
      <TabsList className="border-b">
        {tabPaths.map((tabPath, tabIndex) => (
          <TabsTrigger
            key={tabPath}
            value={tabValues[tabIndex]}
            onClick={() => handleTabClick(tabValues[tabIndex])}
          >
            {tabValues[tabIndex]}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>
        {activeTab === "画像" && <div>{activeTab}</div>}
        {activeTab === "小説" && <div>{activeTab}</div>}
        {activeTab === "コラム" && <div>{activeTab}</div>}
        {activeTab === "シリーズ" && <div>{activeTab}</div>}
        {activeTab === "コレクション" && <div>{activeTab}</div>}
        {activeTab === "スタンプ" && <div>{activeTab}</div>}
        {activeTab === "支援応援" && <div>{activeTab}</div>}
      </TabsContent>
    </Tabs>
  )
}
