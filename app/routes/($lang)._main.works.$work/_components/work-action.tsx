import { Button } from "@/_components/ui/button"
import { FolderIcon } from "lucide-react"
import { MenuPopover } from "./work-action-menu"
import { SharePopover } from "./work-action-share"
import { LikeButton } from "@/_components/like-button"
import { createImageFileFromUrl } from "@/routes/($lang).generation._index/_utils/create-image-file-from-url"
import { downloadImageFile } from "@/routes/($lang).generation._index/_utils/download-image-file"
import { WorkEditorButton } from "@/routes/($lang)._main.works.$work/_components/work-editor-button"

type Props = {
  title?: string
  imageUrl?: string
  workLikesCount: number
  defaultLiked: boolean
  targetWorkId: string
  targetWorkOwnerUserId: string
  isHideEditButton: boolean
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  const onDownload = async () => {
    if (props.imageUrl) {
      const image = await createImageFileFromUrl({
        url: props.imageUrl,
      })
      downloadImageFile(image)
    }
  }

  return (
    <div className="flex justify-end">
      <div className="flex space-x-2">
        <LikeButton
          size={40}
          text={"いいね"}
          defaultLiked={props.defaultLiked}
          defaultLikedCount={props.workLikesCount}
          targetWorkId={props.targetWorkId}
          isBackgroundNone={false}
          targetWorkOwnerUserId={props.targetWorkOwnerUserId}
        />
        {!props.isHideEditButton && (
          <WorkEditorButton
            targetWorkId={props.targetWorkId}
            targetWorkOwnerUserId={props.targetWorkOwnerUserId}
          />
        )}
        <Button aria-label={"フォルダに追加"} size={"icon"} variant="secondary">
          <FolderIcon />
        </Button>
        <SharePopover title={props.title} />
        <MenuPopover onDownload={onDownload} />
      </div>
    </div>
  )
}
