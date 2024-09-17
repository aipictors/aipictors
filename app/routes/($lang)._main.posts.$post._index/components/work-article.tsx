import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { PromptonRequestButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-button"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { WorkArticleGenerationParameters } from "~/routes/($lang)._main.posts.$post._index/components/work-article-generation-parameters"
import { useContext, useEffect, useState } from "react"
import { WorkArticleTags } from "~/routes/($lang)._main.posts.$post._index/components/work-article-tags"
import { type FragmentOf, graphql } from "gql.tada"
import { WorkVideoView } from "~/routes/($lang)._main.posts.$post._index/components/work-video-view"
import { AuthContext } from "~/contexts/auth-context"
import { WorkLikedUser } from "~/routes/($lang)._main.posts.$post._index/components/work-liked-user"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { ToggleContent } from "~/components/toggle-content"
import { Heart, ShieldAlert } from "lucide-react"
import { Separator } from "~/components/ui/separator"
import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { ConstructionAlert } from "~/components/construction-alert"
import { PostAccessTypeBanner } from "~/routes/($lang)._main.posts.$post._index/components/post-acess-type-banner"
import { WorkMarkdownView } from "~/routes/($lang)._main.posts.$post._index/components/work-markdown-view"
import { WorkActionContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"
import { toRatingText } from "~/utils/work/to-rating-text"
import { Badge } from "~/components/ui/badge"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { toStyleText } from "~/utils/work/to-style-text"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
  isDraft?: boolean
}

/**
 * 作品詳細情報
 */
export function WorkArticle(props: Props) {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(viewerBookmarkFolderIdQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const [tagNames, setTagNames] = useState<string[]>(props.work.tagNames)

  const bookmarkFolderId = data?.viewer?.bookmarkFolderId ?? null

  useEffect(() => {
    setTagNames(props.work.tagNames)
  }, [props.work.tagNames])

  return (
    <article className="flex flex-col space-y-4">
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL={`https://www.aipictors.com/works/${props.work.id}`}
        deadline={"2024-07-30"}
      />
      <PostAccessTypeBanner
        createdAt={props.work.createdAt}
        postAccessType={props.work.accessType}
      />
      {props.work.type === "WORK" && (
        <WorkImageView
          workImageURL={props.work.imageURL}
          subWorkImageURLs={props.work.subWorks
            .filter((subWork) => subWork.imageUrl !== null)
            .map((subWork) => {
              return subWork.imageUrl ?? ""
            })}
        />
      )}
      {props.work.type === "VIDEO" && (
        <WorkVideoView videoUrl={props.work.url ?? ""} />
      )}
      {props.work.type === "COLUMN" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={props.work.md ?? ""}
          html={props.work.html ?? ""}
          title={props.work.title}
        />
      )}
      {props.work.type === "NOVEL" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={props.work.md ?? ""}
          html={props.work.html ?? ""}
          title={props.work.title}
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
        <WorkActionContainer
          workLikesCount={props.work.likesCount}
          title={props.work.title}
          imageUrl={props.work.imageURL}
          targetWorkId={props.work.id}
          bookmarkFolderId={bookmarkFolderId}
          targetWorkOwnerUserId={props.work.user.id}
          isDisabledShare={props.isDraft}
        />
        <h1 className="font-bold text-lg">{props.work.title}</h1>
        <div className="flex flex-col space-y-4">
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
            {toDateTimeText(props.work.createdAt)}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
            {props.work.model !== undefined &&
              props.work.model !== null &&
              props.work.model?.length !== 0 && (
                <Badge variant="secondary" className="text-sm">
                  {"使用モデル名:"}
                  <Link
                    to={`https://www.aipictors.com/search/?ai=${props.work.model}`}
                  >
                    {props.work.model}
                  </Link>
                </Badge>
              )}
            {props.work.rating !== null && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span className="text-sm">{"対象年齢:"}</span>
                {toRatingText(props.work.rating)}
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center space-x-2">
              <span className="text-sm">{"テイスト:"}</span>
              {toStyleText(props.work.style)}
            </Badge>

            {props.work.isPromotion === true && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span className="text-sm">{"宣伝作品"}</span>
              </Badge>
            )}
            {props.work.dailyRanking && (
              <Badge
                variant="secondary"
                className="text-sm"
              >{`デイリー入賞 ${props.work.dailyRanking} 位`}</Badge>
            )}
            {props.work.weeklyRanking && (
              <Badge
                variant="secondary"
                className="text-sm"
              >{`ウィークリー入賞 ${props.work.dailyRanking} 位`}</Badge>
            )}
            {props.work.monthlyRanking && (
              <Badge
                variant="secondary"
                className="text-sm"
              >{`マンスリー入賞 ${props.work.dailyRanking} 位`}</Badge>
            )}
          </div>
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
            tagNames={tagNames}
            setTagNames={setTagNames}
            isEditable={props.work.isTagEditable}
          />
        </div>
        <p className="overflow-hidden whitespace-pre-wrap break-words">
          {props.work.description}
        </p>
        {props.work.promptAccessType === "PRIVATE" &&
          props.work.user.id === appContext.userId && (
            <p className="flex items-center gap-x-2 font-bold opacity-60">
              <ShieldAlert className="block h-6 w-6" />
              <p>{"生成情報は非公開状態です、ご自身のみ閲覧可能です"}</p>
            </p>
          )}
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
          <div className="flex items-center space-x-4">
            <Link
              className="flex items-center space-x-2"
              to={`/users/${props.work.user.login}`}
            >
              <Avatar>
                <AvatarImage src={ExchangeIconUrl(props.work.user.iconUrl)} />
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
      id
      bookmarkFolderId
    }
  }`,
)

export const workArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
    id
    isMyRecommended
    title
    md
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
      biography
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconUrl
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      biography
      receivedLikesCount
      createdLikesCount
      createdBookmarksCount
      isMuted
      works(offset: 0, limit: 16, where: { isSensitive: false }) {
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
        isLiked
      }
      promptonUser {
        id
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
      id
      imageUrl
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
)

export const sensitiveWorkArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
    id
    isMyRecommended
    title
    md
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
      biography
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconUrl
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      biography
      receivedLikesCount
      createdLikesCount
      createdBookmarksCount
      isMuted
      works(offset: 0, limit: 16, where: { isSensitive: true }) {
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
        isLiked
      }
      promptonUser {
        id
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
      id
      imageUrl
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
    isPromotion
  }`,
)
