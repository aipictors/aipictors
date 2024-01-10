"use client"

import { Button } from "@/components/ui/button"
import { Folder, Heart, MoreHorizontal, Share } from "lucide-react"
import { useBoolean } from "usehooks-ts"
import { SharePopover } from "./share-popover"

type Props = {
  title?: string
  workLikesCount: number
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  return (
    <>
      <div className="flex justify-end">
        {/* <div className="flex">
        <Button className="rounded-full">
          <HelpCircle className="mr-2" />
          {"画像生成"}
        </Button>
      </div> */}
        <div className="flex space-x-2">
          <Button disabled>
            <Heart className="mr-2" />
            <div className={"flex space-x-2"}>
              <span>{"いいね"}</span>
              <span>{props.workLikesCount}</span>
            </div>
          </Button>
          <Button disabled aria-label={"フォルダに追加"} size={"icon"}>
            <Folder />
          </Button>
          <SharePopover title={props.title} />
        </div>
      </div>
    </>
  )
}
