import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { PromptonRequestButton } from "@/routes/($lang)._main.posts.$post/_components/prompton-request-button"
import { WorkImageView } from "@/routes/($lang)._main.posts.$post/_components/work-image-view"
import { WorkArticleGenerationParameters } from "@/routes/($lang)._main.posts.$post/_components/work-article-generation-parameters"
import { WorkActionContainer } from "@/routes/($lang)._main.posts.$post/_components/work-action-container"
import { Suspense, useContext } from "react"
import { WorkArticleTags } from "@/routes/($lang)._main.posts.$post/_components/work-article-tags"
import { type FragmentOf, graphql } from "gql.tada"
import { IconUrl } from "@/_components/icon-url"
import { WorkHtmlView } from "@/routes/($lang)._main.posts.$post/_components/work-html-view"
import { WorkVideoView } from "@/routes/($lang)._main.posts.$post/_components/work-video-view"
import { AuthContext } from "@/_contexts/auth-context"
import { WorkLikedUser } from "@/routes/($lang)._main.posts.$post/_components/work-liked-user"
import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { ToggleContent } from "@/_components/toggle-content"
import { Heart } from "lucide-react"
import { Separator } from "@/_components/ui/separator"
import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { ConstructionAlert } from "@/_components/construction-alert"
import { PostAccessTypeBanner } from "@/routes/($lang)._main.posts.$post/_components/post-acess-type-banner"
import { subWorkFieldsFragment } from "@/_graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "@/_graphql/fragments/user-fields"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(viewerBookmarkFolderIdQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const bookmarkFolderId = data?.viewer?.bookmarkFolderId ?? null

  return (
    <article className="flex flex-col space-y-2">
      <ConstructionAlert
        type="WARNING"
        message="このページは現在開発中です。不具合が起きる可能性があります。"
        fallbackURL={`https://www.aipictors.com/works/${props.work.id}`}
        deadline={"2024-07-30"}
      />
      <PostAccessTypeBanner postAccessType={props.work.accessType} />
      {props.work.type === "WORK" && (
        <WorkImageView
          workImageURL={props.work.imageURL}
          subWorkImageURLs={props.work.subWorks.map((subWork) => {
            return subWork.imageUrl ?? ""
          })}
        />
      )}
      {props.work.type === "VIDEO" && (
        <WorkVideoView videoUrl={props.work.url ?? ""} />
      )}
      {props.work.type === "COLUMN" && (
        <WorkHtmlView
          thumbnailUrl={props.work.imageURL}
          html={props.work.html ?? ""}
        />
      )}
      {props.work.type === "NOVEL" && (
        <WorkHtmlView
          thumbnailUrl={props.work.imageURL}
          html={props.work.html ?? ""}
        />
      )}
      <section className="mt-4 space-y-4">
        {props.work.isGeneration && (
          <Link to={`/generation?work=${props.work.id}`}>
            <Button variant={"secondary"} className="w-full">
              参照生成する
            </Button>
          </Link>
        )}
        <Suspense>
          <WorkActionContainer
            workLikesCount={props.work.likesCount}
            title={props.work.title}
            imageUrl={props.work.imageURL}
            targetWorkId={props.work.id}
            bookmarkFolderId={bookmarkFolderId}
            targetWorkOwnerUserId={props.work.user.id}
          />
        </Suspense>
        <h1 className="font-bold text-lg">{props.work.title}</h1>
        <div className="flex flex-col space-y-2">
          {/* いいねしたユーザ一覧 */}
          {appContext.userId === props.work.user.id && (
            <ToggleContent
              trigger={
                <div className="flex items-center space-x-2">
                  <Heart
                    className={"fill-white text-black dark:text-white"}
                    size={16}
                    strokeWidth={1}
                  />
                  <p className="font-bold text-sm">{`${props.work.likesCount}`}</p>
                </div>
              }
            >
              <div>
                <Separator className="mt-2 mb-2" />
                <CarouselWithGradation
                  items={props.work.likedUsers.map((user) => (
                    <WorkLikedUser
                      key={user.id}
                      name={user.name}
                      iconUrl={user.iconUrl}
                      login={user.login}
                    />
                  ))}
                />
              </div>
            </ToggleContent>
          )}

          <span className="text-sm">
            {"使用モデル名:"}
            <Link
              to={`https://www.aipictors.com/search/?ai=${props.work.model}`}
            >
              {props.work.model}
            </Link>
          </span>
          <span className="text-sm">
            {toDateTimeText(props.work.createdAt)}
          </span>
          {props.work.dailyRanking && (
            <span className="text-sm">{`デイリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.weeklyRanking && (
            <span className="text-sm">{`ウィークリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.monthlyRanking && (
            <span className="text-sm">{`マンスリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.dailyTheme && (
            <div className="flex items-center">
              <span className="text-sm">{"参加お題:"}</span>
              <Link
                to={`https://www.aipictors.com/search?word=${props.work.dailyTheme.title}`}
              >
                <Button variant={"link"}>{props.work.dailyTheme.title}</Button>
              </Link>
            </div>
          )}
          <WorkArticleTags
            postId={props.work.id}
            tagNames={props.work.tagNames}
            isEditable={props.work.isTagEditable}
          />
        </div>
        <p className="overflow-hidden whitespace-pre-wrap break-words">
          {props.work.description}
        </p>

        <WorkArticleGenerationParameters
          prompt={props.work.prompt}
          negativePrompt={props.work.negativePrompt}
          steps={props.work.steps}
          scale={props.work.scale}
          seed={props.work.seed}
          sampler={props.work.sampler}
          strength={props.work.strength}
          otherGenerationParams={props.work.otherGenerationParams}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              className="flex items-center space-x-2"
              to={`/users/${props.work.user.login}`}
            >
              <Avatar>
                <AvatarImage src={IconUrl(props.work.user.iconUrl)} />
                <AvatarFallback />
              </Avatar>
              <span>{props.work.user.name}</span>
            </Link>
            {props.work.user.promptonUser?.id !== undefined &&
              props.work.user.id !== appContext?.userId && (
                <PromptonRequestButton
                  promptonId={props.work.user.promptonUser.id}
                />
              )}
          </div>
        </div>
      </section>
    </article>
  )
}

const viewerBookmarkFolderIdQuery = graphql(
  `query ViewerBookmarkFolderId {
    viewer {
      bookmarkFolderId
    }
  }`,
)

export const workArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
    id
    isMyRecommended
    title
    accessType
    type
    adminAccessType
    promptAccessType
    rating
    description
    isSensitive
    enTitle
    enDescription
    imageURL
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
    subWorksCount
    user {
      id
      promptonUser {
        id
      }
      ...UserFields
      isFollower
      isFollowee
      isMuted
      works(offset: 0, limit: 16) {
        id
        userId
        largeThumbnailImageURL
        largeThumbnailImageWidth
        largeThumbnailImageHeight
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
        subWorksCount
      }
    }
    likedUsers(offset: 0, limit: 32) {
      id
      name
      iconUrl
      login
    }
    album {
      id
      title
      description
    }
    dailyTheme {
      id
      title
    }
    tagNames
    createdAt
    likesCount
    viewsCount
    commentsCount
    subWorks {
      ...SubWorkFields
    }
    nextWork {
      id
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    previousWork {
      id
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    model
    modelHash
    generationModelId
    workModelId
    isTagEditable
    isCommentsEditable
    isLiked
    isBookmarked
    isInCollection
    isPromotion
    isGeneration
    ogpThumbnailImageUrl
    prompt
    negativePrompt
    noise
    seed
    steps
    sampler
    scale
    strength
    vae
    clipSkip
    otherGenerationParams
    pngInfo
    style
    url
    html
    updatedAt
    dailyRanking
    weeklyRanking
    monthlyRanking
    relatedUrl
    nanoid
  }`,
  [userFieldsFragment, subWorkFieldsFragment],
)
