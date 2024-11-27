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
import { PostAccessTypeBanner } from "~/routes/($lang)._main.posts.$post._index/components/post-acess-type-banner"
import { WorkMarkdownView } from "~/routes/($lang)._main.posts.$post._index/components/work-markdown-view"
import { WorkActionContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"
import { toRatingText } from "~/utils/work/to-rating-text"
import { Badge } from "~/components/ui/badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { toStyleText } from "~/utils/work/to-style-text"
import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
}

/**
 * 作品詳細情報
 */
export function DraftWorkArticle(props: Props) {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(viewerBookmarkFolderIdQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
  })

  const [tagNames, setTagNames] = useState<string[]>(props.work.tagNames)

  const bookmarkFolderId = data?.viewer?.bookmarkFolderId ?? null

  const toDateTextUrl = (time: number, dateFormat: string) => {
    const date = new Date(time * 1000)
    return format(date, dateFormat)
  }

  useEffect(() => {
    setTagNames(props.work.tagNames)
  }, [props.work.tagNames])

  const t = useTranslation()

  const [markdownContent, setMarkdownContent] = useState<string>("")

  useEffect(() => {
    // マークダウンファイルの URL からマークダウンを取得する
    if (props.work.mdUrl) {
      fetch(props.work.mdUrl)
        .then((res) => res.text())
        .then((text) => {
          setMarkdownContent(text)
        })
        .catch((err) => console.error("Error fetching markdown file:", err))
    }
  }, [props.work.mdUrl])

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    props.work.imageURL,
  )

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link
            target="_blank"
            rel="noopener noreferrer"
            key={index.toString()}
            to={part}
          >
            {part}
          </Link>
        )
      }
      return part
    })
  }

  return (
    <article className="flex flex-col space-y-4">
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
          onSelectedImage={setSelectedImageUrl}
        />
      )}
      {props.work.type === "VIDEO" && (
        <WorkVideoView videoUrl={props.work.url ?? ""} />
      )}
      {props.work.type === "COLUMN" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={markdownContent}
          title={props.work.title}
        />
      )}
      {props.work.type === "NOVEL" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={markdownContent}
          title={props.work.title}
        />
      )}
      <section className="mt-4 space-y-4">
        {props.work.isGeneration && (
          <Link to={`/generation?work=${props.work.id}`}>
            <Button variant={"secondary"} className="w-full">
              {t("参照生成する", "Generate reference")}
            </Button>
          </Link>
        )}
        <WorkActionContainer
          workLikesCount={props.work.likesCount}
          title={props.work.title}
          description={props.work.description ?? ""}
          currentImageUrl={selectedImageUrl}
          imageUrls={[
            props.work.imageURL,
            ...props.work.subWorks.map((subWork) => subWork.imageUrl ?? ""),
          ]}
          targetWorkId={props.work.id}
          bookmarkFolderId={bookmarkFolderId}
          targetWorkOwnerUserId={props.work.user?.id ?? ""}
          isDisabledShare={true}
        />
        <h1 className="font-bold text-lg">
          {t(
            props.work.title,
            props.work.enTitle.length > 0
              ? props.work.enTitle
              : props.work.title,
          )}
        </h1>
        <div className="flex flex-col space-y-4">
          {/* いいねしたユーザ一覧 */}
          {props.work.user !== null &&
            appContext.userId === props.work.user.id && (
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
                <Link to={`/models/${props.work.model}`}>
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <span className="text-md">
                      {t("使用モデル名", "model name used")}
                      {":"}
                    </span>
                    <span className="text-md">{props.work.model}</span>
                  </Badge>
                </Link>
              )}
            {props.work.rating !== null && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span className="text-md">
                  {t("対象年齢", "target age")}
                  {":"}
                </span>
                {toRatingText(props.work.rating)}
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center space-x-2">
              <span className="text-md">
                {t("スタイル", "style")}
                {":"}
              </span>
              {toStyleText(props.work.style)}
            </Badge>

            {props.work.isPromotion === true && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span className="text-md">
                  {t("宣伝作品", "Promotional work")}
                </span>
              </Badge>
            )}
            {props.work.dailyRanking && (
              <Link
                to={`/rankings/${toDateTextUrl(props.work.createdAt, "yyyy/MM/dd")}`}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  {t("デイリー入賞", "Daily Rank")} {props.work.dailyRanking}{" "}
                  {t("位", "Rank")}
                </Badge>
              </Link>
            )}
            {props.work.weeklyRanking && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-2"
              >
                {t("ウィークリー入賞", "Weekly Rank")} {props.work.dailyRanking}{" "}
                {t("位", "Rank")}
              </Badge>
            )}
            {props.work.monthlyRanking && (
              <Link
                to={`/rankings/${toDateTextUrl(props.work.createdAt, "yyyy/MM")}`}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  {t("マンスリー入賞", "Monthly Rank")}{" "}
                  {props.work.dailyRanking} {t("位", "Rank")}
                </Badge>
              </Link>
            )}
          </div>
          {props.work.dailyTheme && (
            <div className="flex items-center">
              <span className="text-md">
                {t("参加お題", "participation theme")}
                {":"}
              </span>
              <Link
                to={`/themes/${props.work.dailyTheme.dateText.replace(/-/g, "/")}`}
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
          {parseTextWithLinks(
            t(
              props.work.description ?? "",
              props.work.enDescription ?? props.work.description ?? "",
            ),
          )}
        </p>
        {props.work.promptAccessType === "PRIVATE" &&
          props.work.user !== null &&
          props.work.user.id === appContext.userId && (
            <p className="flex items-center gap-x-2 font-bold opacity-60">
              <ShieldAlert className="block h-6 w-6" />
              <p>
                {t(
                  "生成情報は非公開状態です、ご自身のみ閲覧可能です",
                  "Generation information is private and only viewable by you.",
                )}
              </p>
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

        {props.work.user !== null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                className="flex items-center space-x-2"
                to={`/users/${props.work.user.login}`}
              >
                <Avatar>
                  <AvatarImage
                    src={withIconUrlFallback(props.work.user.iconUrl)}
                  />
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
        )}
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
    mdUrl
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
      enBiography
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
    likedUsers(offset: 0, limit: 120) {
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
      dateText
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
    mdUrl
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
      enBiography
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
    likedUsers(offset: 0, limit: 120) {
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
      dateText
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
    updatedAt
    dailyRanking
    weeklyRanking
    monthlyRanking
    relatedUrl
    nanoid
    isPromotion
  }`,
)
