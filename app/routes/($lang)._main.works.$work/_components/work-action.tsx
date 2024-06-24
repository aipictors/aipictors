import {} from "lucide-react"
import { MenuPopover } from "./work-action-menu"
import { SharePopover } from "./work-action-share"
import { LikeButton } from "@/_components/like-button"
import { createImageFileFromUrl } from "@/routes/($lang).generation._index/_utils/create-image-file-from-url"
import { downloadImageFile } from "@/routes/($lang).generation._index/_utils/download-image-file"
import { WorkEditorButton } from "@/routes/($lang)._main.works.$work/_components/work-editor-button"
import {} from "@apollo/client/index"
import { Suspense, useContext } from "react"
import { WorkActionBookmark } from "@/routes/($lang)._main.works.$work/_components/work-action-bookmark"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { RecommendButton } from "@/_components/recommend-button"

type Props = {
  title?: string
  imageUrl?: string
  bookmarkFolderId: string | null
  workLikesCount: number
  defaultLiked: boolean
  defaultBookmarked: boolean
  targetWorkId: string
  targetWorkOwnerUserId: string
  isHideEditButton: boolean
  isRecommended: boolean
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkAction = (props: Props) => {
  const appContext = useContext(AuthContext)

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
        <RecommendButton
          workId={props.targetWorkId}
          ownerUserId={props.targetWorkOwnerUserId}
          isRecommended={props.isRecommended}
        />
        {!props.isHideEditButton && (
          <WorkEditorButton
            targetWorkId={props.targetWorkId}
            targetWorkOwnerUserId={props.targetWorkOwnerUserId}
          />
        )}
        {props.targetWorkOwnerUserId !== appContext.userId && (
          <Suspense fallback={<AppLoadingPage />}>
            <WorkActionBookmark
              targetWorkId={props.targetWorkId}
              bookmarkFolderId={props.bookmarkFolderId}
              defaultBookmarked={props.defaultBookmarked}
            />
          </Suspense>
        )}
        <SharePopover title={props.title} />
        <MenuPopover onDownload={onDownload} />
      </div>
    </div>
  )
}
