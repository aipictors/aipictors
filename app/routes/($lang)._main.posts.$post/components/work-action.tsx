import { MenuPopover } from "./work-action-menu"
import { SharePopover } from "./work-action-share"
import { LikeButton } from "~/components/like-button"
import { createImageFileFromUrl } from "~/routes/($lang).generation._index/utils/create-image-file-from-url"
import { downloadImageFile } from "~/routes/($lang).generation._index/utils/download-image-file"
import { WorkEditorButton } from "~/routes/($lang)._main.posts.$post/components/work-editor-button"
import { Suspense, useContext } from "react"
import { WorkActionBookmark } from "~/routes/($lang)._main.posts.$post/components/work-action-bookmark"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { RecommendButton } from "~/components/recommend-button"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  title?: string
  imageUrl?: string
  workType: IntrospectionEnum<"WorkType">
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
            type={props.workType}
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
        <MenuPopover
          onDownload={onDownload}
          isEnabledDelete={props.targetWorkOwnerUserId === appContext.userId}
          postId={props.targetWorkId}
        />
      </div>
    </div>
  )
}