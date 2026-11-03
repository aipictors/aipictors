import { Heart, Loader2Icon, StampIcon } from "lucide-react"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { WorkCommentSupportPanel } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-support-panel"
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * コメントの入力欄（推し、隠し付き、スタンプのボタンを含む）
 */
export function WorkCommentForm(
  props: WorkCommentListState & { isWorkOwnerBlocked?: boolean },
) {
  const t = useTranslation()
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

  return (
    <div className="space-y-3">
      <div className="flex w-full items-start gap-3">
        <UserAvatarWithFrame
          alt={appContext.displayName ?? ""}
          frame={userAvatarFrame}
          isAnimated={false}
          sizeClassName="size-10 shrink-0"
          src={withIconUrlFallback(userIcon)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            <div className="min-w-0 flex-1">
              <AutoResizeTextarea
                autoResize
                minHeight="46px"
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
                disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey)
                  ) {
                    event.preventDefault()
                    onWorkComment()
                  }
                }}
                className="min-h-[46px] w-full rounded-2xl border-border/70 bg-background px-4 py-3"
              />
            </div>
            {isCreatingWorkComment ? (
              <Button
                disabled
                className="h-[46px] min-h-[46px] rounded-2xl px-5 text-sm"
              >
                <Loader2Icon className="size-4 animate-spin" />
              </Button>
            ) : (
              <Button
                disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                variant={comment.trim().length > 0 ? "default" : "secondary"}
                onClick={onWorkComment}
                className={cn(
                  "h-[46px] min-h-[46px] whitespace-nowrap rounded-2xl px-5 text-sm",
                  currentSupportDraft &&
                    "border-0 bg-gradient-to-r from-pink-500 to-rose-500 px-3 font-bold text-white hover:opacity-90",
                )}
              >
                {currentSupportDraft
                  ? t(
                      `${currentSupportDraft.totalPt}pt 推す`,
                      `Send ${currentSupportDraft.totalPt}pt`,
                    )
                  : t("送信", "Send")}
              </Button>
            )}
          </div>
        </div>
      </div>
      {isSupportOpen && !props.isWorkOwnerBlocked && !isOwnWork && (
        <WorkCommentSupportPanel {...props} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 pl-13 md:pl-14">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Checkbox
            id="sensitive-checkbox"
            checked={isSensitive}
            onCheckedChange={(checked: boolean) =>
              setIsSensitive(checked === true)
            }
            disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
          />
          <label htmlFor="sensitive-checkbox">
            {t("隠し付き", "Sensitive comment")}
          </label>
          <CrossPlatformTooltip
            text={t(
              "初期表示は非表示になります。クリックで表示されます。",
              "You can check new works with this tag in your timeline",
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          {!isOwnWork && (
            <Button
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
              variant="secondary"
              aria-label={t("推しを付ける", "Add support")}
              aria-expanded={isSupportOpen}
              className={cn(
                "h-9 gap-1 rounded-full px-3 text-xs",
                isSupportOpen &&
                  "bg-rose-500/15 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300",
              )}
              onClick={() => {
                if (isSupportOpen) {
                  // 閉じたら推しは付けない
                  setSupportCoinAmount("FREE", "0")
                } else {
                  void reloadCoinSummary()
                }
                setIsSupportOpen((value) => !value)
              }}
            >
              <Heart
                className={cn("size-4", isSupportOpen && "fill-current")}
              />
              {t("推す", "Support")}
            </Button>
          )}
          <Button
            disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
            variant="secondary"
            size="icon"
            className="size-9 rounded-full"
            aria-label={t("スタンプを送る", "Send a sticker")}
            onClick={onOpen}
          >
            <StampIcon className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
