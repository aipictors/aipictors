import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { format } from "date-fns"
import { type FragmentOf, graphql } from "gql.tada"
import { Heart, ShieldAlert } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { ToggleContent } from "~/components/toggle-content"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { AiEvaluationDisplay } from "~/routes/($lang)._main.posts.$post._index/components/ai-evaluation-display"
import { PostAccessTypeBanner } from "~/routes/($lang)._main.posts.$post._index/components/post-acess-type-banner"
import { PromptonRequestButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-button"
import { WorkActionContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"
import { WorkArticleGenerationParameters } from "~/routes/($lang)._main.posts.$post._index/components/work-article-generation-parameters"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { WorkLikedUser } from "~/routes/($lang)._main.posts.$post._index/components/work-liked-user"
import { WorkMarkdownView } from "~/routes/($lang)._main.posts.$post._index/components/work-markdown-view"
import { WorkSensitiveArticleTags } from "~/routes/($lang)._main.posts.$post._index/components/work-sensitive-article-tags"
import { WorkVideoView } from "~/routes/($lang)._main.posts.$post._index/components/work-video-view"
import type { userSensitiveSettingFragment } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-container"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { translateText } from "~/utils/translate-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { toRatingText } from "~/utils/work/to-rating-text"
import { toStyleText } from "~/utils/work/to-style-text"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
  userSetting?: FragmentOf<typeof userSensitiveSettingFragment>
}

/**
 * 作品詳細情報
 */
export function SensitiveWorkArticle(props: Props) {
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

  const [targetLanguage, setTargetLanguage] = useState<string | null>(null)
  const [isShowingTranslation, setIsShowingTranslation] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedTitle, setTranslatedTitle] = useState("")
  const [translatedDescription, setTranslatedDescription] = useState("")

  useEffect(() => {
    setTargetLanguage((navigator.language ?? "en").split("-")[0] ?? "en")
  }, [])

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

  useEffect(() => {
    setIsShowingTranslation(false)
    setIsTranslating(false)
    setTranslatedTitle("")
    setTranslatedDescription("")
  }, [props.work.id])

  const displayTitle = t(
    props.work.title,
    props.work.enTitle.length > 0 ? props.work.enTitle : props.work.title,
  )

  const displayDescription = t(
    props.work.description ?? "",
    props.work.enDescription ?? props.work.description ?? "",
  )

  const isProbablyJapanese = (text: string) =>
    /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/.test(text)

  const isProbablyEnglish = (text: string) =>
    /[A-Za-z]/.test(text) &&
    !/[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF]/.test(
      text,
    )

  const detectLanguage = (text: string): "ja" | "en" | null => {
    if (isProbablyJapanese(text)) return "ja"
    if (isProbablyEnglish(text)) return "en"
    return null
  }

  const combinedText = `${displayTitle}\n${displayDescription}`.trim()
  const sourceLanguage = combinedText ? detectLanguage(combinedText) : null

  const shouldShowTranslateLink = Boolean(
    combinedText &&
      targetLanguage &&
      (sourceLanguage === null || sourceLanguage !== targetLanguage),
  )

  const translateLinkLabel =
    targetLanguage === "ja"
      ? t("日本語に翻訳", "Translate to Japanese")
      : t("翻訳", "Translate")

  const onClickTranslate = async () => {
    if (!combinedText) return

    if (isShowingTranslation) {
      setIsShowingTranslation(false)
      return
    }

    if (translatedTitle.length > 0 || translatedDescription.length > 0) {
      setIsShowingTranslation(true)
      return
    }

    const language =
      targetLanguage ?? (navigator.language ?? "en").split("-")[0] ?? "en"

    setIsShowingTranslation(true)
    setIsTranslating(true)
    try {
      const [titleResult, descriptionResult] = await Promise.all([
        displayTitle.length > 0
          ? translateText({
              text: displayTitle,
              sourceLanguage: "auto",
              targetLanguage: language,
            })
          : Promise.resolve(""),
        displayDescription.length > 0
          ? translateText({
              text: displayDescription,
              sourceLanguage: "auto",
              targetLanguage: language,
            })
          : Promise.resolve(""),
      ])

      setTranslatedTitle(titleResult)
      setTranslatedDescription(descriptionResult)
    } finally {
      setIsTranslating(false)
    }
  }

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
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
      <section className="mt-4 flex flex-col space-y-4">
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
          description={
            (props.work.description?.length ?? 0) > 100
              ? `${props.work.description?.slice(0, 100)}...`
              : (props.work.description ?? "")
          }
          currentImageUrl={selectedImageUrl}
          imageUrls={[
            props.work.imageURL,
            ...props.work.subWorks.map((subWork) => subWork.imageUrl ?? ""),
          ]}
          targetWorkId={props.work.id}
          bookmarkFolderId={bookmarkFolderId}
          targetWorkOwnerUserId={props.work.user?.id ?? ""}
          isDisabledShare={false}
        />
        <h1 className="font-bold text-lg">{displayTitle}</h1>
        {isShowingTranslation && translatedTitle.length > 0 && (
          <p className="whitespace-pre-wrap break-words text-muted-foreground text-sm">
            {translatedTitle}
          </p>
        )}
        <div className="flex flex-col space-y-4">
          {/* いいねしたユーザ一覧 */}
          {props.work.user && appContext.userId === props.work.user.id ? (
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
          ) : (
            <div className="flex items-center space-x-2">
              <Heart
                className={"fill-white text-black dark:text-white"}
                size={16}
                strokeWidth={1}
              />
              <p className="font-bold text-sm">{`${props.work.likesCount}`}</p>
            </div>
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
              <span className="text-sm">
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
          <WorkSensitiveArticleTags
            postId={props.work.id}
            tagNames={tagNames}
            setTagNames={setTagNames}
            isEditable={props.work.isTagEditable}
          />
        </div>
        <div className="space-y-2">
          <p className="overflow-hidden whitespace-pre-wrap break-words">
            {parseTextWithLinks(displayDescription)}
          </p>
          {shouldShowTranslateLink && (
            <button
              type="button"
              onClick={onClickTranslate}
              disabled={isTranslating}
              className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground disabled:cursor-default disabled:opacity-50"
            >
              {isShowingTranslation
                ? t("原文を表示", "Show original")
                : translateLinkLabel}
            </button>
          )}
          {isShowingTranslation && displayDescription.length > 0 && (
            <div className="rounded-md bg-muted p-2">
              {isTranslating ? (
                <p className="text-muted-foreground text-xs">
                  {t("翻訳中...", "Translating...")}
                </p>
              ) : (
                <p className="whitespace-pre-wrap break-words text-muted-foreground text-sm">
                  {translatedDescription}
                </p>
              )}
            </div>
          )}
        </div>
        {props.work.relatedUrl !== null &&
          props.work.relatedUrl !== "undefined" &&
          props.work.relatedUrl?.length > 0 && (
            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p>{t("関連リンク", "related url")}</p>
                  <Link to={`${props.work.relatedUrl}`}>
                    {props.work.relatedUrl}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        {props.work.promptAccessType === "PRIVATE" &&
          props.work.user &&
          props.work.user.id === appContext.userId && (
            <p className="flex items-center gap-x-2 font-bold opacity-60">
              <ShieldAlert className="block size-6" />
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
        {/* AI評価表示 */}
        <div className="flex justify-start">
          <AiEvaluationDisplay
            isBotGradingEnabled={props.work.isBotGradingEnabled ?? false}
            evaluation={props.work.botEvaluation}
            personality={props.work.botEvaluation?.personality}
            isVisible={true}
            isBotGradingPublic={props.work.isBotGradingPublic}
            isOwner={props.work.user?.id === appContext.userId}
            workId={props.work.id}
          />
        </div>

        {props.work.user && (
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
    url
    isDeleted
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
        commentsCount
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
    isBotGradingEnabled
    isBotGradingPublic
    botEvaluation {
      cutenessScore
      coolnessScore
      beautyScore
      originalityScore
      compositionScore
      colorScore
      detailScore
      consistencyScore
      overallScore
      comment
      personality
    }
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
    isDeleted
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
      works(offset: 0, limit: 16, where: { isSensitive: true, ratings: [R18, R18G] }) {
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
        commentsCount
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
    isBotGradingEnabled
    isBotGradingPublic
    botEvaluation {
      id
      cutenessScore
      coolnessScore
      beautyScore
      originalityScore
      compositionScore
      colorScore
      detailScore
      consistencyScore
      overallScore
      comment
      personality
    }
  }`,
)

export const userSettingFragment = graphql(
  `fragment UserSetting on UserSettingNode @_unmask {
      id
  }`,
)
