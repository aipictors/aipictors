import { Button } from "@/_components/ui/button"
import { FolderIcon } from "lucide-react"
import MenuPopover from "./work-action-menu"
import { SharePopover } from "./work-action-share"
import { LikeButton } from "@/_components/like-button"

type Props = {
  title?: string
  imageUrl?: string
  workLikesCount: number
  defaultLiked: boolean
  targetWorkId: string
  targetWorkOwnerUserId: string
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  return (
    <div className="flex justify-end">
      <div className="flex space-x-2">
        <LikeButton
          size={40}
          text={"いいね"}
          defaultLiked={props.defaultLiked}
          defaultLikedCount={props.workLikesCount}
          targetWorkId={props.targetWorkId}
          targetWorkOwnerUserId={props.targetWorkOwnerUserId}
        />
        <Button aria-label={"フォルダに追加"} size={"icon"} variant="secondary">
          <FolderIcon />
        </Button>
        <SharePopover title={props.title} />
        <MenuPopover />
      </div>
    </div>
  )
}
