import type React from "react"
import { useQuery } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import { Heart, ShieldAlert } from "lucide-react"
import { startTransition, useContext, useEffect, useState } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { OfficialBadge } from "~/components/official-badge"
import { ToggleContent } from "~/components/toggle-content"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { AiEvaluationDisplay } from "~/routes/($lang)._main.posts.$post._index/components/ai-evaluation-display"
import { WorkMarkdownView } from "~/routes/($lang)._main.posts.$post._index/components/lazy-work-markdown-view"
import { PostAccessTypeBanner } from "~/routes/($lang)._main.posts.$post._index/components/post-acess-type-banner"
import { WorkActionContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"
import { WorkAlbumCard } from "~/routes/($lang)._main.posts.$post._index/components/work-album-card"
import { WorkPromotionBanner } from "~/components/work/work-promotion"
import type {
  userSettingFragment,
  workArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article-fragments"
import { WorkArticleBadges } from "~/routes/($lang)._main.posts.$post._index/components/work-article-badges"
import { detectLanguage } from "~/routes/($lang)._main.posts.$post._index/components/work-article-utils"
import { WorkArticleDescription } from "~/routes/($lang)._main.posts.$post._index/components/work-article-description"
import { WorkArticleGenerationParameters } from "~/routes/($lang)._main.posts.$post._index/components/work-article-generation-parameters"
import { WorkArticleTags } from "~/routes/($lang)._main.posts.$post._index/components/work-article-tags"
import { WorkAuthorFollowButton } from "~/routes/($lang)._main.posts.$post._index/components/work-author-follow-button"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { WorkLikedUser } from "~/routes/($lang)._main.posts.$post._index/components/work-liked-user"
import { WorkVideoView } from "~/routes/($lang)._main.posts.$post._index/components/work-video-view"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { getWorkThumbnailHint } from "~/utils/work-thumbnail-hint"
import { translateText } from "~/utils/translate-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { fetchMarkdownText } from "~/utils/fetch-markdown-text"

export {
  sensitiveWorkArticleFragment,
  userSettingFragment,
  workArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article-fragments"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
  userSetting?: FragmentOf<typeof userSettingFragment>
  mode?: "dialog" | "page"
  /** 作者の表示（渡すとタイトルの下に置き、記事の末尾の作者の行は出さない） */
  authorSlot?: React.ReactNode
  /** R18 の作品ページ */
  isSensitive?: boolean
  /** アルバムを親が別の場所に出す（作品ページは「XXさんの作品」の下） */
  isAlbumHidden?: boolean
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

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const bookmarkFolderId = data?.viewer?.bookmarkFolderId ?? null

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
    // 別の作品へ移動したら、前の作品の本文を残さない
    setMarkdownContent("")
    // マークダウンファイルの URL からマークダウンを取得する
    if (!props.work.mdUrl) return
    let isCurrent = true
    fetchMarkdownText(props.work.mdUrl)
      .then((text) => {
        // 先に開いた作品の本文が後から届いても上書きしない
        if (!isCurrent) return
        // hydration が終わる前に急ぎの更新として届くと、遅延読み込みの Suspense の中身を
        // React が作り直してしまう（React error #421）
        startTransition(() => {
          setMarkdownContent(text)
        })
      })
      .catch((err) => console.error("Error fetching markdown file:", err))
    return () => {
      isCurrent = false
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

  const combinedText = `${displayTitle}\n${displayDescription}`.trim()

  // 長い説明は畳んで、コメントや他の作品まで早くたどり着けるようにする
  const isDescriptionLong =
    displayDescription.length > 240 || displayDescription.split("\n").length > 6
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

  const workImageAspectRatio =
    props.work.largeThumbnailImageHeight > 0
      ? props.work.largeThumbnailImageWidth /
        props.work.largeThumbnailImageHeight
      : undefined

  // 小説・コラムは作者が選べば、キャプションを本文の前（前書き）に出す
  const isCaptionBeforeBody =
    (props.work.type === "NOVEL" || props.work.type === "COLUMN") &&
    props.work.isCaptionBeforeBody === true &&
    displayDescription.trim() !== ""

  const descriptionView = (
    <WorkArticleDescription
            displayDescription={displayDescription}
            isDescriptionExpanded={isDescriptionExpanded}
            isDescriptionLong={isDescriptionLong}
            isShowingTranslation={isShowingTranslation}
            isTranslating={isTranslating}
            onClickTranslate={onClickTranslate}
            setIsDescriptionExpanded={setIsDescriptionExpanded}
            shouldShowTranslateLink={shouldShowTranslateLink}
            translateLinkLabel={translateLinkLabel}
            translatedDescription={translatedDescription}
          />
  )

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
          workImageAspectRatio={workImageAspectRatio}
          placeholderUrl={getWorkThumbnailHint(
            props.work.id,
            workImageAspectRatio,
          )}
          mode={props.mode}
        />
      )}
      {props.work.type === "VIDEO" && (
        <WorkVideoView
          videoUrl={props.work.url ?? ""}
          posterUrl={props.work.smallThumbnailImageURL}
          title={t(props.work.title, props.work.enTitle || undefined)}
        />
      )}
      {isCaptionBeforeBody && descriptionView}
      {props.work.type === "COLUMN" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={markdownContent}
          title={t(props.work.title, props.work.enTitle || undefined)}
          workId={props.work.id}
          workType="COLUMN"
          authorName={props.work.user?.name}
          foreword={isCaptionBeforeBody ? displayDescription : undefined}
        />
      )}
      {props.work.type === "NOVEL" && (
        <WorkMarkdownView
          thumbnailUrl={props.work.imageURL}
          md={markdownContent}
          title={t(props.work.title, props.work.enTitle || undefined)}
          workId={props.work.id}
          workType="NOVEL"
          authorName={props.work.user?.name}
          foreword={isCaptionBeforeBody ? displayDescription : undefined}
        />
      )}
      <section className="mt-4 flex flex-col space-y-4">
        {props.work.isPromotion === true && (
          <WorkPromotionBanner
            relatedUrl={props.work.relatedUrl}
            userName={props.work.user?.name}
          />
        )}
        {props.work.isGeneration && (
          <Link to={`/generation?work=${props.work.id}`}>
            <Button variant={"secondary"} className="w-full">
              {t("参照生成する", "Generate reference")}
            </Button>
          </Link>
        )}
        <h1 className="break-words font-bold text-xl leading-snug tracking-tight md:text-2xl">
          {displayTitle}
        </h1>
        {isShowingTranslation && translatedTitle.length > 0 && (
          <p className="whitespace-pre-wrap break-words text-muted-foreground text-sm">
            {translatedTitle}
          </p>
        )}
        <WorkActionContainer
          accessType={props.work.accessType}
          workLikesCount={props.work.likesCount}
          title={t(props.work.title, props.work.enTitle || undefined)}
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
          defaultLiked={props.work.isLiked}
          defaultBookmarked={props.work.isBookmarked}
          targetWorkOwnerUserId={props.work.user?.id ?? ""}
          isRecommended={props.work.isMyRecommended}
          isDisabledShare={false}
          isSensitive={props.work.isSensitive}
          workType={props.work.type}
          isTargetUserBlocked={Boolean(props.work.user?.isBlocked)}
        />
        {props.authorSlot}
        <div className="flex flex-col space-y-3">
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
                {props.work.likesCount > 0 &&
                  props.work.likedUsers.length === 0 && (
                    <p className="mb-2 text-muted-foreground text-sm">
                      {t(
                        "匿名いいねのみのため表示できるユーザはいません",
                        "No non-anonymous likes to display",
                      )}
                    </p>
                  )}
                <CarouselWithGradation
                  items={props.work.likedUsers.map((user) => (
                    <WorkLikedUser
                      key={user.id}
                      name={user.name}
                      avatarFrame={user.avatarFrame}
                      iconUrl={user.iconUrl}
                      login={user.login}
                    />
                  ))}
                />
              </div>
            </ToggleContent>
          ) : null}
          <span className="text-muted-foreground text-sm">
            {toDateTimeText(props.work.createdAt)}
          </span>
          <WorkArticleBadges work={props.work} />
          {props.work.dailyTheme && (
            <Link
              to={`/themes/${props.work.dailyTheme.dateText.replace(/-/g, "/")}`}
              className="w-fit text-sm hover:underline"
            >
              <span className="text-muted-foreground">
                {t("参加お題", "Theme")}:
              </span>{" "}
              <span className="font-medium">{props.work.dailyTheme.title}</span>
            </Link>
          )}
          <WorkArticleTags
            isSensitive={props.isSensitive}
            postId={props.work.id}
            tagNames={tagNames}
            setTagNames={setTagNames}
            isEditable={props.work.isTagEditable}
          />
        </div>
        {!isCaptionBeforeBody && descriptionView}
        {props.work.relatedUrl !== null &&
          props.work.relatedUrl !== "undefined" &&
          props.work.relatedUrl?.length > 0 && (
            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p>{t("関連リンク", "related url")}</p>
                  <a
                    href={props.work.relatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {props.work.relatedUrl}
                  </a>
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
            status={props.work.botEvaluationStatus}
            isVisible={true}
            isBotGradingPublic={props.work.isBotGradingPublic ?? false}
            isOwner={props.work.user?.id === appContext.userId}
            workId={props.work.id}
          />
        </div>

        {props.work.album && !props.isAlbumHidden && (
          <WorkAlbumCard album={props.work.album} />
        )}

        {props.work.user && !props.authorSlot && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center space-x-4">
              <Link
                className="flex items-center space-x-2"
                to={`/users/${props.work.user.login}`}
              >
                <UserAvatarWithFrame
                  alt={props.work.user.name}
                  frame={props.work.user.avatarFrame}
                  isAnimated={false}
                  sizeClassName="size-10"
                  src={withIconUrlFallback(props.work.user.iconUrl)}
                />
                <span>{props.work.user.name}</span>
              </Link>
              <OfficialBadge
                isOfficial={props.work.user.isOfficial}
                isModerator={props.work.user.isModerator}
              />
            </div>
            <WorkAuthorFollowButton
              userId={props.work.user.id}
              userName={props.work.user.name}
            />
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
