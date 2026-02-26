import { useMutation } from "@apollo/client/index"
import { Avatar } from "@radix-ui/react-avatar"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  ArrowDownToLine,
  Eye,
  EyeOff,
  Heart,
  Loader2Icon,
  ThumbsUpIcon,
} from "lucide-react"
import React from "react"
import { toast } from "sonner"
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { DeleteCommentConfirmDialog } from "~/routes/($lang)._main.posts.$post._index/components/delete-comment-confirm-dialog"
import { ReplyCommentInput } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-input"
import { StickerInfoDialog } from "~/routes/($lang)._main.users.$user._index/components/sticker-info-dialog"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { translateText } from "~/utils/translate-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  isMine: boolean
  userIconImageURL?: string
  userName?: string
  text?: string
  createdAt: number
  replyId: string
  targetCommentId: string
  userId: string
  iconUrl: string
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  workOwnerIconImageURL?: string
  isWorkOwnerLiked: boolean
  isLoadingCommentLike?: boolean
  isDisabledCommentLike?: boolean
  isNowLiked: boolean
  /* コメントで使われてるスタンプ情報 */
  stickerImageURL?: string
  stickerTitle?: string
  stickerId?: string
  stickerAccessType?: string
  isStickerDownloadable?: boolean
  onDeleteComment: () => void
  onReplyCompleted?: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
  onCreateCommentLike: () => void
  onDeleteCommentLike: () => void
  isWorkOwnerBlocked?: boolean
}

/**
 * 作品のコメントへの返信
 */
export function WorkCommentResponse(props: Props) {
  const t = useTranslation()

  const [targetLanguage, setTargetLanguage] = React.useState<string | null>(
    null,
  )

  const [deleteMutation, { loading: isDeleteLoading }] = useMutation(
    deleteCommentMutation,
  )

  const [openReplyInput, setOpenReplyInput] = React.useState(false)
  const [showMutedComment, setShowMutedComment] = React.useState(false)
  const [showSensitiveComment, setShowSensitiveComment] = React.useState(false)

  const [isShowingTranslation, setIsShowingTranslation] = React.useState(false)
  const [translatedText, setTranslatedText] = React.useState<string | null>(
    null,
  )
  const [isTranslating, setIsTranslating] = React.useState(false)

  React.useEffect(() => {
    setTargetLanguage((navigator.language ?? "en").split("-")[0] ?? "en")
  }, [])

  const isProbablyJapanese = (text: string) =>
    /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/.test(text)

  const shouldShowTranslateLink = Boolean(
    props.text &&
      targetLanguage &&
      !(targetLanguage === "ja" && isProbablyJapanese(props.text)),
  )

  const translateLinkLabel =
    targetLanguage === "ja"
      ? t("日本語に翻訳", "Translate to Japanese")
      : t("翻訳", "Translate")

  const onClickTranslate = async () => {
    if (!props.text) return

    if (isShowingTranslation) {
      setIsShowingTranslation(false)
      return
    }

    setIsShowingTranslation(true)

    if (translatedText) return
    if (typeof window === "undefined") return

    const language =
      targetLanguage ?? (navigator.language ?? "en").split("-")[0] ?? "en"

    setIsTranslating(true)
    try {
      const result = await translateText({
        text: props.text,
        sourceLanguage: "auto",
        targetLanguage: language,
      })

      if (!result) {
        setIsShowingTranslation(false)
        toast.error(
          t(
            "翻訳に失敗しました。しばらくしてからお試しください。",
            "Failed to translate. Please try again later.",
          ),
        )
        return
      }

      setTranslatedText(result)
    } catch (e) {
      console.error(e)
      setIsShowingTranslation(false)
      toast.error(
        t(
          "翻訳に失敗しました。しばらくしてからお試しください。",
          "Failed to translate. Please try again later.",
        ),
      )
    } finally {
      setIsTranslating(false)
    }
  }

  const onDeleteComment = async () => {
    props.onDeleteComment()
    try {
      await deleteMutation({
        variables: {
          input: {
            commentId: props.replyId,
          },
        },
      })
    } catch (e) {
      console.error(e)
      toast.error(
        t(
          "既に削除済みの可能性があります、しばらくしたら反映されます",
          "It may have already been deleted, it will be reflected after a while",
        ),
      )
    }
  }

  // ミュートされたコメントの表示
  if (props.isMuted && !showMutedComment) {
    return (
      <div className="flex items-center space-x-4 rounded-lg border p-2 pl-16">
        <EyeOff className="size-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm">
            {t(
              "ミュートしているユーザの返信です",
              "This is a reply from a muted user",
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowMutedComment(true)}
        >
          <Eye className="mr-2 size-4" />
          {t("表示", "Show")}
        </Button>
      </div>
    )
  }

  // センシティブなコメントの表示
  if (props.isSensitive && !showSensitiveComment) {
    return (
      <div className="flex items-center space-x-4 rounded-lg border p-2 pl-16">
        <EyeOff className="size-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm">
            {t(
              "隠し付き（もしくはセンシティブ）な返信です",
              "This is a sensitive reply",
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSensitiveComment(true)}
        >
          <Eye className="mr-2 size-4" />
          {t("表示", "Show")}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "flex items-start space-x-4 pl-16",
          props.isMuted &&
            "border-gray-300 border-l-2 pl-[66px] opacity-60 dark:border-gray-700",
        )}
      >
        <Link className="block size-10" to={`/users/${props.userId}`}>
          <Avatar className="block size-10">
            <AvatarImage
              className="size-10 rounded-full"
              src={props.userIconImageURL}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
        </Link>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Link to={`/users/${props.userId}`}>
              <p>{props.userName}</p>
            </Link>
            {props.isMuted && (
              <div className="flex items-center space-x-1">
                <EyeOff className="size-3 text-gray-400" />
                <span className="text-gray-500 text-xs dark:text-gray-400">
                  {t("ミュート中", "Muted")}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
              {props.text}
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
            {isShowingTranslation && (
              <div className="rounded-md bg-muted p-2">
                {isTranslating ? (
                  <p className="text-muted-foreground text-xs">
                    {t("翻訳中...", "Translating...")}
                  </p>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-muted-foreground text-sm">
                    {translatedText}
                  </p>
                )}
              </div>
            )}
          </div>
          {props.stickerImageURL && props.stickerAccessType === "PUBLIC" && (
            <Link
              className="group block w-32 overflow-hidden rounded-md"
              to={`/stickers/${props.stickerId}`}
            >
              <img
                className="w-32 overflow-hidden rounded-md py-2 transition-transform duration-300 group-hover:scale-105"
                alt=""
                src={props.stickerImageURL}
              />
            </Link>
          )}
          {props.stickerImageURL && props.stickerAccessType !== "PUBLIC" && (
            <img className="w-32 py-2" alt="" src={props.stickerImageURL} />
          )}
          <div className="flex items-center space-x-2">
            <p className="text-xs opacity-50">
              {toDateTimeText(props.createdAt, true)}
            </p>
            {props.isWorkOwnerLiked && (
              <div className="relative">
                <Avatar className="relative size-4">
                  <AvatarImage
                    src={withIconUrlFallback(props.workOwnerIconImageURL)}
                    alt=""
                  />
                  <AvatarFallback />
                </Avatar>
                <Heart
                  className={"absolute right-0 bottom-0 fill-rose-500"}
                  size={"8"}
                />
              </div>
            )}
            {
              <div className="flex items-center space-x-2">
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={
                    props.isLiked
                      ? props.onDeleteCommentLike
                      : props.onCreateCommentLike
                  }
                  disabled={props.isDisabledCommentLike}
                  className={"flex items-center space-x-1"}
                >
                  <ThumbsUpIcon
                    className={cn(
                      "w-3",
                      props.isLiked || props.isNowLiked
                        ? "fill-black dark:fill-white"
                        : "",
                    )}
                  />
                  {props.likesCount + (props.isNowLiked ? 1 : 0) > 0 && (
                    <p className="cursor-pointer text-xs">
                      {props.likesCount + (props.isNowLiked ? 1 : 0)}
                    </p>
                  )}
                </Button>
              </div>
            }
            {props.isMine ? (
              isDeleteLoading ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <DeleteCommentConfirmDialog onDeleteComment={onDeleteComment} />
              )
            ) : (
              <>
                {/* biome-ignore lint/a11y/useButtonType: Reply button doesn't need explicit type */}
                <button onClick={() => setOpenReplyInput(!openReplyInput)}>
                  <p className="cursor-pointer text-xs">{t("返信", "Reply")}</p>
                </button>
                {props.stickerImageURL &&
                  props.stickerAccessType === "PUBLIC" && (
                    <StickerInfoDialog
                      isDownloaded={props.isStickerDownloadable ?? false}
                      stickerId={props.stickerId ?? ""}
                      title={props.stickerTitle ?? ""}
                      imageUrl={props.stickerImageURL}
                    >
                      <ArrowDownToLine className="size-4" />
                    </StickerInfoDialog>
                  )}
              </>
            )}
            {props.isMuted && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMutedComment(false)}
              >
                <EyeOff className="mr-1 size-3" />
                {t("非表示", "Hide")}
              </Button>
            )}
            {props.isSensitive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSensitiveComment(false)}
              >
                <EyeOff className="mr-1 size-3" />
                {t("非表示", "Hide")}
              </Button>
            )}
          </div>
        </div>
      </div>
      {!props.isMine && openReplyInput && (
        <ReplyCommentInput
          targetCommentId={props.targetCommentId}
          onReplyCompleted={(
            id: string,
            text: string,
            stickerId,
            stickerImageURL: string,
          ) => {
            if (props.onReplyCompleted) {
              props.onReplyCompleted(id, text, stickerId, stickerImageURL)
            }
          }}
          iconUrl={props.iconUrl}
          isWorkOwnerBlocked={props.isWorkOwnerBlocked}
        />
      )}
    </>
  )
}

const deleteCommentMutation = graphql(
  `mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }`,
)
