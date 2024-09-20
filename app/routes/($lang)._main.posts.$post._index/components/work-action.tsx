import { MenuPopover } from "./work-action-menu"
import { SharePopover } from "./work-action-share"
import { LikeButton } from "~/components/like-button"
import { createImageFileFromUrl } from "~/routes/($lang).generation._index/utils/create-image-file-from-url"
import { downloadImageFile } from "~/routes/($lang).generation._index/utils/download-image-file"
import { WorkEditorButton } from "~/routes/($lang)._main.posts.$post._index/components/work-editor-button"
import { Suspense, useContext } from "react"
import { WorkActionBookmark } from "~/routes/($lang)._main.posts.$post._index/components/work-action-bookmark"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { RecommendButton } from "~/routes/($lang)._main.posts.$post._index/components/recommend-button"
import { useTranslation } from "~/hooks/use-translation"

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
  isDisabledShare?: boolean
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export function WorkAction(props: Props) {
  const t = useTranslation()

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
          text={t("いいね", "Like")}
          defaultLiked={props.defaultLiked}
          defaultLikedCount={props.workLikesCount}
          targetWorkId={props.targetWorkId}
          isBackgroundNone={false}
          targetWorkOwnerUserId={props.targetWorkOwnerUserId}
          isUsedShortcutKey={true}
        />
        <Suspense fallback={null}>
          <RecommendButton
            workId={props.targetWorkId}
            ownerUserId={props.targetWorkOwnerUserId}
            isRecommended={props.isRecommended}
          />
        </Suspense>
        {!props.isHideEditButton && (
          <WorkEditorButton
            targetWorkId={props.targetWorkId}
            targetWorkOwnerUserId={props.targetWorkOwnerUserId}
            type={props.workType}
          />
        )}
        {props.targetWorkOwnerUserId !== appContext.userId && (
          <WorkActionBookmark
            targetWorkId={props.targetWorkId}
            bookmarkFolderId={props.bookmarkFolderId}
            defaultBookmarked={props.defaultBookmarked}
          />
        )}
        <SharePopover
          isDisabledShare={props.isDisabledShare}
          title={props.title}
          id={props.targetWorkId}
        />
        <MenuPopover
          onDownload={onDownload}
          isEnabledDelete={props.targetWorkOwnerUserId === appContext.userId}
          postId={props.targetWorkId}
        />
      </div>
    </div>
  )
}
