import { useApolloClient } from "@apollo/client/index"
import {
  EyeOffIcon,
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
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { isUserAvatarDecoration } from "~/utils/user-avatar-frame"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

/** 入力欄の下に並ぶ小さな切り替えボタン（スタンプ・隠し付き） */
const toolButtonClassName =
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"

/**
 * コメントの入力欄。入力・スタンプ・隠し付き・送信を 1 つの枠にまとめる（送信ボタンは右下の 1 つだけ）。
 * 作品への推し（推し付きコメント）は終了したので、推しの欄は出さない。推しは作者の欄の「作者を推す」から
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
    isCreatingWorkComment,
    isSensitive,
    onOpen,
    onWorkComment,
    setComment,
    setIsSensitive,
    userAvatarFrame,
    userIcon,
  } = props

  const isDisabled = !authContext.isLoggedIn || props.isWorkOwnerBlocked
  const canSend = comment.trim().length > 0

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
            aria-label={t("送信", "Send")}
            className="h-9 shrink-0 gap-1.5 whitespace-nowrap rounded-full px-4 text-sm"
          >
            {isCreatingWorkComment ? (
              <Loader2Icon className="size-4 animate-spin" />
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
