"use client"

import { Button } from "@/components/ui/button"
import { Folder, Heart, HelpCircle, MoreHorizontal, Share } from "lucide-react"

type Props = {
  workLikesCount: number
}

export const WorkAction = (props: Props) => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <Button className="rounded-full">
          <HelpCircle className="mr-2" />
          {"画像生成"}
        </Button>
      </div>
      <div className="flex">
        <Button className="rounded">
          <Heart className="mr-2" />
          <div className={"flex space-x-2"}>
            <span>{"いいね"}</span>
            <span>{props.workLikesCount}</span>
          </div>
        </Button>
        <Button aria-label={"フォルダに追加"} size={"icon"}>
          <Folder />
        </Button>
        <Button aria-label={"シェア"} size={"icon"}>
          <Share />
        </Button>
        <Button aria-label={"メニュー"} size={"icon"}>
          <MoreHorizontal />
        </Button>
      </div>
    </div>
  )
}
