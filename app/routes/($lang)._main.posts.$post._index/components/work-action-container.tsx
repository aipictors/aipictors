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
  rating?: string | null
  isTargetUserBlocked?: boolean
  mode?: "default" | "dialogLikeOnly"
}

/**
 * 設定の「いいねの表示」から、この作品へのいいねを匿名にするか。設定をまだ読めていなければ undefined
 * API と同じく R-15 は R-15 の設定（未設定なら全年齢）、R18・R18G はセンシティブの設定を使う
 * （WorkNode.isSensitive は R-15 でも true なので rating で分ける）
 */
export function isAnonymousLikeBySetting(
  setting:
    | {
        isAnonymousLikeAllAges?: boolean | null
        isAnonymousLikeR15?: boolean | null
        isAnonymousLikeSensitive?: boolean | null
      }
    | null
    | undefined,
  isSensitive: boolean,
  rating?: string | null,
): boolean | undefined {
  if (!setting) return undefined
  if (rating === "G") {
    return setting.isAnonymousLikeAllAges ?? false
  }
  if (rating === "R15") {
    return setting.isAnonymousLikeR15 ?? setting.isAnonymousLikeAllAges ?? false
  }
  return isSensitive
    ? (setting.isAnonymousLikeSensitive ?? true)
    : (setting.isAnonymousLikeAllAges ?? false)
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export function WorkActionContainer(props: Props) {
  const appContext = useContext(AuthContext)

  const { data: userSettingData } = useQuery(userSettingQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const isAnonymousLike = isAnonymousLikeBySetting(
    userSettingData?.userSetting,
    props.isSensitive === true,
    props.rating,
  )

  const likeButtonLabel = isAnonymousLike === true ? "匿名いいね" : "いいね"

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
      isAnonymousLike={isAnonymousLike}
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
      isAnonymousLikeR15
      isAnonymousLikeSensitive
    }
  }`,
)
