import { useApolloClient } from "@apollo/client/index"
import {
  EyeOffIcon,
  Heart,
  Loader2Icon,
  SendHorizontalIcon,
  StampIcon,
} from "lucide-react"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Button } from "~/components/ui/button"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { prefetchViewerStickers } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import { WorkCommentSupportPanel } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-support-panel"
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { isUserAvatarDecoration } from "~/utils/user-avatar-frame"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

/** 入力欄の下に並ぶ小さな切り替えボタン（スタンプ・推す・隠し付き） */
const toolButtonClassName =
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"

/**
 * コメントの入力欄。入力・スタンプ・推し・隠し付き・送信を 1 つの枠にまとめ、
 * 推しを開いたときは同じ枠の中に金額の欄を出す（送信ボタンは右下の 1 つだけ）
 */
export function WorkCommentForm(
  props: WorkCommentListState & { isWorkOwnerBlocked?: boolean },
) {
  const t = useTranslation()
  const client = useApolloClient()
  const {
    appContext,
    authContext,
    comment,
    currentSupportDraft,
    isCreatingWorkComment,
    isOwnWork,
    isSensitive,
    isSupportOpen,
    onOpen,
    onWorkComment,
    reloadCoinSummary,
    setComment,
    setIsSensitive,
    setIsSupportOpen,
    setSupportCoinAmount,
    userAvatarFrame,
    userIcon,
  } = props

  const isDisabled = !authContext.isLoggedIn || props.isWorkOwnerBlocked
  const isSupportVisible =
    isSupportOpen && !props.isWorkOwnerBlocked && !isOwnWork
  const canSend = comment.trim().length > 0 || currentSupportDraft !== null

  const toggleSupport = () => {
    if (isSupportOpen) {
      // 閉じたら推しは付けない
      setSupportCoinAmount("FREE", "0")
    } else {
      void reloadCoinSummary()
    }
    setIsSupportOpen((value) => !value)
  }

  return (
    <div className="flex w-full items-start gap-3">
      <UserAvatarWithFrame
        alt={appContext.displayName ?? ""}
        frame={userAvatarFrame}
        // アイコンの外にはみ出す装飾は、左端で画面の外に切れないように間を空ける
        frameClassName={
          isUserAvatarDecoration(userAvatarFrame) ? "ml-2.5" : undefined
        }
        isAnimated={false}
        sizeClassName="size-10 shrink-0"
        src={toIconImageUrl(userIcon)}
      />
      <div
        className={cn(
          "min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background transition-[border-color,box-shadow]",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
          isSupportVisible &&
            "border-rose-500/40 focus-within:border-rose-500/60 focus-within:ring-rose-500/10",
          isDisabled && "bg-muted/40",
        )}
      >
        <AutoResizeTextarea
          autoResize
          minHeight="48px"
          onChange={(event) => {
            setComment(event.target.value)
          }}
          rows={1}
          value={comment}
          placeholder={
            authContext.isNotLoggedIn
              ? t("ログインするとコメントできます", "Log in to comment")
              : isSupportVisible
                ? t("応援メッセージ（なくても推せます）", "Message (optional)")
                : t("コメントする", "Add a comment")
          }
          disabled={isDisabled}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              onWorkComment()
            }
          }}
          className="min-h-[48px] w-full resize-none rounded-none border-0 bg-transparent px-4 pt-3 pb-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {isSensitive && (
          <p className="flex items-center gap-1 px-4 pb-1 text-[11px] text-amber-600 dark:text-amber-400">
            <EyeOffIcon className="size-3" />
            {t(
              "隠し付き：最初は伏せて表示され、押すと見えます",
              "Hidden: shown collapsed until someone taps it",
            )}
          </p>
        )}
        {isSupportVisible && (
          <div className="border-rose-500/20 border-t bg-rose-500/[0.03] px-3 py-3">
            <WorkCommentSupportPanel {...props} onClose={toggleSupport} />
          </div>
        )}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              disabled={isDisabled}
              className={toolButtonClassName}
              aria-label={t("スタンプを選ぶ", "Choose a sticker")}
              onClick={onOpen}
              onPointerEnter={() => {
                if (authContext.isLoggedIn) void prefetchViewerStickers(client)
              }}
            >
              <StampIcon className="size-4" />
              <span className="hidden sm:inline">
                {t("スタンプ", "Sticker")}
              </span>
            </button>
            {!isOwnWork && (
              <button
                type="button"
                disabled={isDisabled}
                aria-pressed={isSupportOpen}
                aria-label={t("推しを付ける", "Add support")}
                className={cn(
                  toolButtonClassName,
                  isSupportOpen &&
                    "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 hover:text-rose-600 dark:text-rose-300",
                )}
                onClick={toggleSupport}
              >
                <Heart
                  className={cn("size-4", isSupportOpen && "fill-current")}
                />
                {currentSupportDraft
                  ? `${currentSupportDraft.totalPt.toLocaleString()}pt`
                  : t("推す", "Support")}
              </button>
            )}
            <button
              type="button"
              disabled={isDisabled}
              aria-pressed={isSensitive}
              aria-label={t("隠し付きにする", "Mark as hidden")}
              title={t(
                "最初は伏せて表示され、押すと見えるコメントにします",
                "Show this comment collapsed until someone taps it",
              )}
              className={cn(
                toolButtonClassName,
                isSensitive &&
                  "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 hover:text-amber-700 dark:text-amber-300",
              )}
              onClick={() => setIsSensitive(!isSensitive)}
            >
              <EyeOffIcon className="size-4" />
              <span className="hidden sm:inline">
                {t("隠し付き", "Hidden")}
              </span>
            </button>
          </div>
          <Button
            disabled={isDisabled || isCreatingWorkComment || !canSend}
            onClick={() => void onWorkComment()}
            aria-label={
              currentSupportDraft
                ? t(
                    `${currentSupportDraft.totalPt}pt 推して送信`,
                    `Send with ${currentSupportDraft.totalPt}pt`,
                  )
                : t("送信", "Send")
            }
            className={cn(
              "h-9 shrink-0 gap-1.5 whitespace-nowrap rounded-full px-4 text-sm",
              currentSupportDraft &&
                "border-0 bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white hover:opacity-90",
            )}
          >
            {isCreatingWorkComment ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : currentSupportDraft ? (
              <>
                <Heart className="size-4 fill-current" />
                {t(
                  `${currentSupportDraft.totalPt.toLocaleString()}pt 推す`,
                  `Send ${currentSupportDraft.totalPt.toLocaleString()}pt`,
                )}
              </>
            ) : (
              <>
                <SendHorizontalIcon className="size-4" />
                {t("送信", "Send")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
