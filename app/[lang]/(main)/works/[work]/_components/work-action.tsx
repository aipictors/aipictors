"use client"

import { MenuDropdown } from "@/app/[lang]/(main)/works/[work]/_components/menu-dropdown"
import { ShareDropdown } from "@/app/[lang]/(main)/works/[work]/_components/share-dropdown"
import { Button } from "@/components/ui/button"
import { Folder, Heart, MoreHorizontal, Share } from "lucide-react"
import { useBoolean } from "usehooks-ts"

type Props = {
  workLikesCount: number
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  const {
    value: isMenuOpen,
    setTrue: onMenuOpen,
    setFalse: onMenuClose,
  } = useBoolean()

  const {
    value: isShareOpen,
    setTrue: onShareOpen,
    setFalse: onShareClose,
  } = useBoolean()

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
          <Button>
            <Heart className="mr-2" />
            <div className={"flex space-x-2"}>
              <span>{"いいね"}</span>
              <span>{props.workLikesCount}</span>
            </div>
          </Button>
          <Button aria-label={"フォルダに追加"} size={"icon"}>
            <Folder />
          </Button>
          <Button aria-label={"シェア"} size={"icon"} onClick={onShareOpen}>
            <Share />
          </Button>
          <Button aria-label={"メニュー"} size={"icon"} onClick={onMenuOpen}>
            <MoreHorizontal />
          </Button>
        </div>
      </div>
      <MenuDropdown isOpen={isMenuOpen} onClose={onMenuClose} />
      <ShareDropdown isOpen={isShareOpen} onClose={onShareClose} />
    </>
  )
}
