"use client"

import { FollowButton } from "@/_components/button/follow-button"
import { Avatar } from "@/_components/ui/avatar"
import { FlagIcon } from "lucide-react"

export const CollectionHeader = () => {
  return (
    <div className="flex flex-col">
      <img
        src={"https://source.unsplash.com/random/800x600"}
        alt={"コレクションの画像"}
      />
      <div className="flex">
        <p className="text-lg">{"コレクション名"}</p>
        <FollowButton />
      </div>
      <div className="flex">
        <Avatar />
        <p>{"ユーザー名"}</p>
      </div>
      <p>{"コレクションの説明"}</p>
      <div className="flex">
        <p>{"12個の作品"}</p>
        <FlagIcon />
      </div>
      <p>{"＃銅像"}</p>
    </div>
  )
}
