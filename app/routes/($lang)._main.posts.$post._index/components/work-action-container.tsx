import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { WorkAction } from "~/routes/($lang)._main.posts.$post._index/components/work-action"

type Props = {
  accessType?: string
  uuid?: string | null
  title?: string
  description?: string
  currentImageUrl?: string
  imageUrls?: string[]
  workLikesCount: number
  targetWorkId: string
  targetWorkOwnerUserId: string
  bookmarkFolderId: string | null
  defaultLiked: boolean
  defaultBookmarked: boolean
  isRecommended: boolean
  workType: string
  isDisabledShare?: boolean
  isSensitive?: boolean
  isTargetUserBlocked?: boolean
  mode?: "default" | "dialogLikeOnly"
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export function WorkActionContainer(props: Props) {
  const appContext = useContext(AuthContext)

  const { data: userSettingData } = useQuery(userSettingQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const likeButtonLabel =
    props.isSensitive ||
    userSettingData?.userSetting?.isAnonymousLikeAllAges !== true
      ? "いいね"
      : "匿名いいね"

  return (
    <WorkAction
      id={props.targetWorkId}
      accessType={props.accessType}
      uuid={props.uuid}
      workLikesCount={props.workLikesCount}
      title={props.title}
      description={props.description}
      currentImageUrl={props.currentImageUrl}
      imageUrls={props.imageUrls}
      defaultLiked={props.defaultLiked}
      defaultBookmarked={props.defaultBookmarked}
      likeButtonLabel={likeButtonLabel}
      bookmarkFolderId={props.bookmarkFolderId}
      targetWorkId={props.targetWorkId}
      targetWorkOwnerUserId={props.targetWorkOwnerUserId}
      isHideEditButton={false}
      isRecommended={props.isRecommended}
      isSensitive={props.isSensitive}
      isDisabledShare={props.isDisabledShare}
      workType={props.workType as "COLUMN" | "NOVEL" | "WORK" | "VIDEO"}
      isTargetUserBlocked={props.isTargetUserBlocked}
      mode={props.mode}
    />
  )
}

const userSettingQuery = graphql(
  `query WorkActionUserSetting {
    userSetting {
      id
      isAnonymousLikeAllAges
    }
  }`,
)
