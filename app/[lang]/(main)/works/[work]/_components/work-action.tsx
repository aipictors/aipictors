"use client"

import { Button } from "@/components/ui/button"
import { FolderIcon, HeartIcon } from "lucide-react"
import MenuPopover from "./work-action-menu"
import { SharePopover } from "./work-action-share"

type Props = {
  title?: string
  imageUrl?: string
  workLikesCount: number
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  return (
    <div className="flex justify-end">
      <div className="flex space-x-2">
        <Button disabled>
          <HeartIcon className="mr-2" />
          <div className={"flex space-x-2"}>
            <span>{"いいね"}</span>
            <span>{props.workLikesCount}</span>
          </div>
        </Button>
        <Button aria-label={"フォルダに追加"} size={"icon"}>
          <FolderIcon />
        </Button>
        <SharePopover title={props.title} />
        <MenuPopover />
      </div>
    </div>
  )
}
