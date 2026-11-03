import { Link } from "~/lib/app/locale-router"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  HeartIcon,
  RepeatIcon,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  canEditThemeProposalNote,
  ThemeProposalNoteEditDialog,
} from "~/routes/($lang)._main.themes.proposals._index/components/theme-proposal-note-edit-dialog"

export type ThemeProposalCardItem = {
  id: string
  title: string
  enTitle: string
  promptName: string
  inputTheme: string
  targetDate: string
  status: string
  proposerUserId: string
  proposerName: string
  proposerIconUrl: string
  allowOtherDate: boolean
  note?: string | null
  decisionComment?: string | null
  createdAt: number
  updatedAt: number
  decidedAt?: number | null
  adoptedSubjectId?: string | null
  canCancel: boolean
  likesCount: number
  isLiked: boolean
}

type Props = {
  proposal: ThemeProposalCardItem
  viewerUserId: string | null
  isLoggedIn: boolean
  isCanceling: boolean
  onToggleLike(proposal: ThemeProposalCardItem): void
  onCancel(proposalId: string): Promise<void>
  onUpdated(): void
}

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

/**
 * お題提案1件のカード
 */
export function ThemeProposalCard(props: Props) {
  const t = useTranslation()

  const [isExpanded, setIsExpanded] = useState(false)

  const [isCancelOpen, setIsCancelOpen] = useState(false)

  const proposal = props.proposal

  const targetDate = new Date(`${proposal.targetDate}T00:00:00`)

  const isOwnProposal = props.viewerUserId === proposal.proposerUserId

  const canLike = props.isLoggedIn && !isOwnProposal

  const status = getStatusStyle(proposal.status)

  const pictorMessage = getPictorMessage(t, proposal)

  // 受付中で判定コメントがまだ無いものは、同じ定型文が並ぶだけなので出さない
  const hasPictorComment =
    proposal.status !== "PENDING" ||
    (proposal.decisionComment !== null &&
      proposal.decisionComment !== undefined &&
      proposal.decisionComment.length > 0)

  const adoptedPath = `/themes/${proposal.targetDate.slice(0, 4)}/${Number(proposal.targetDate.slice(5, 7))}/${Number(proposal.targetDate.slice(8, 10))}`

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition hover:shadow-md",
        status.cardClassName,
      )}
    >
      <div className={cn("h-1 w-full", status.barClassName)} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-bold text-[11px]",
                status.badgeClassName,
              )}
            >
              {getStatusLabel(t, proposal.status)}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <CalendarDaysIcon className="size-3.5" />
              {format(targetDate, "M/d (EEE)", { locale: ja })}
            </span>
            {proposal.allowOtherDate && proposal.status === "PENDING" && (
              <span
                className="inline-flex items-center gap-0.5 text-muted-foreground text-xs"
                title={t(
                  "この日が見送りでも別の日に回せます",
                  "Can be moved to another date",
                )}
              >
                <RepeatIcon className="size-3" />
                {t("他の日もOK", "Flexible")}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!canLike}
            onClick={() => props.onToggleLike(proposal)}
            aria-pressed={proposal.isLiked}
            title={
              canLike
                ? proposal.isLiked
                  ? t("いいねを取り消す", "Unlike")
                  : t("いいね", "Like")
                : isOwnProposal
                  ? t(
                      "自分の提案にはいいねできません",
                      "You cannot like your own proposal",
                    )
                  : t("ログインするといいねできます", "Sign in to like")
            }
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 font-semibold text-sm transition active:scale-95",
              proposal.isLiked
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-border bg-background text-muted-foreground hover:border-rose-300 hover:text-rose-500",
              !canLike &&
                "cursor-default opacity-70 hover:border-border hover:text-muted-foreground",
            )}
          >
            <HeartIcon
              className={cn("size-4", proposal.isLiked && "fill-current")}
            />
            {proposal.likesCount}
          </button>
        </div>

        <h3 className="break-words font-bold text-lg leading-snug">
          「{proposal.inputTheme}」
        </h3>

        {proposal.note && proposal.note.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className={cn(
              "whitespace-pre-wrap text-left text-muted-foreground text-sm leading-relaxed",
              !isExpanded && "line-clamp-2",
            )}
          >
            {proposal.note}
          </button>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link
            to={`/users/${proposal.proposerUserId}`}
            className="flex min-w-0 items-center gap-2 hover:underline"
          >
            <Avatar className="size-7">
              <AvatarImage
                resizeWidth={64}
                src={withIconUrlFallback(proposal.proposerIconUrl)}
                alt=""
              />
              <AvatarFallback className="text-[10px]">
                {proposal.proposerName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{proposal.proposerName}</span>
          </Link>
          <span className="shrink-0 text-muted-foreground text-xs">
            {format(new Date(proposal.createdAt * 1000), "M/d HH:mm")}
          </span>
        </div>

        {hasPictorComment && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="flex w-full items-start gap-2 rounded-xl bg-muted/60 p-2.5 text-left transition hover:bg-muted"
          >
            <Avatar className="size-6 shrink-0">
              <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="" />
              <AvatarFallback>ぴ</AvatarFallback>
            </Avatar>
            <p
              className={cn(
                "min-w-0 flex-1 text-xs leading-relaxed",
                !isExpanded && "line-clamp-2",
              )}
            >
              <span className="font-semibold">
                {t("ぴくたーちゃん", "Pictor-chan")}:{" "}
              </span>
              {pictorMessage}
            </p>
            <ChevronDownIcon
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        )}

        {isExpanded && (
          <div className="space-y-1 rounded-xl border border-dashed p-3 text-muted-foreground text-xs">
            <p>
              <span className="font-medium text-foreground">
                {t("整えたお題", "Normalized")}:
              </span>{" "}
              {proposal.title}
              {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
            </p>
            {proposal.promptName.length > 0 && (
              <p className="break-all">
                <span className="font-medium text-foreground">Prompt:</span>{" "}
                {proposal.promptName}
              </p>
            )}
            <p>
              {t("送信", "Submitted")}:{" "}
              {format(new Date(proposal.createdAt * 1000), "yyyy/MM/dd HH:mm")}
              {proposal.decidedAt &&
                ` ・ ${t("判定", "Decided")}: ${format(new Date(proposal.decidedAt * 1000), "yyyy/MM/dd HH:mm")}`}
            </p>
          </div>
        )}

        {(proposal.canCancel ||
          canEditThemeProposalNote(proposal, props.viewerUserId) ||
          (proposal.status === "ADOPTED" && proposal.adoptedSubjectId)) && (
          <div className="flex flex-wrap justify-end gap-2">
            {proposal.status === "ADOPTED" && proposal.adoptedSubjectId && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <Link to={adoptedPath}>
                  {t("お題ページを見る", "Open the theme")}
                </Link>
              </Button>
            )}
            {canEditThemeProposalNote(proposal, props.viewerUserId) && (
              <ThemeProposalNoteEditDialog
                proposalId={proposal.id}
                note={proposal.note}
                onUpdated={props.onUpdated}
              />
            )}
            {proposal.canCancel && (
              <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive"
                  >
                    {t("取り消す", "Withdraw")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("提案を取り消しますか？", "Withdraw this proposal?")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t(
                        `「${proposal.inputTheme}」の提案を取り消します。`,
                        `This withdraws "${proposal.inputTheme}".`,
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("戻る", "Back")}</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={props.isCanceling}
                      onClick={async () => {
                        await props.onCancel(proposal.id)
                        setIsCancelOpen(false)
                      }}
                    >
                      {props.isCanceling
                        ? t("処理中", "Working")
                        : t("取り消す", "Withdraw")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function getStatusLabel(
  t: ReturnType<typeof useTranslation>,
  status: string,
) {
  switch (status) {
    case "ADOPTED":
      return t("採用", "Adopted")
    case "REJECTED":
      return t("見送り", "Not selected")
    case "CANCELED":
      return t("取り消し", "Withdrawn")
    default:
      return t("受付中", "Open")
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "ADOPTED":
      return {
        barClassName: "bg-linear-to-r from-emerald-400 to-teal-400",
        badgeClassName:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        cardClassName: "",
      }
    case "REJECTED":
    case "CANCELED":
      return {
        barClassName: "bg-zinc-300 dark:bg-zinc-700",
        badgeClassName:
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        cardClassName: "",
      }
    default:
      return {
        barClassName: "bg-linear-to-r from-amber-400 to-rose-400",
        badgeClassName:
          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        cardClassName: "border-amber-200 dark:border-amber-900/60",
      }
  }
}

export function getPictorMessage(
  t: ReturnType<typeof useTranslation>,
  proposal: Pick<
    ThemeProposalCardItem,
    "decisionComment" | "status" | "inputTheme"
  >,
) {
  if (proposal.decisionComment && proposal.decisionComment.length > 0) {
    return proposal.decisionComment
  }

  switch (proposal.status) {
    case "ADOPTED":
      return t(
        `「${proposal.inputTheme}」を採用したよ。みんなの支持が集まった注目のお題だね。`,
        `I picked "${proposal.inputTheme}". It gathered strong support from everyone.`,
      )
    case "REJECTED":
      return t(
        `今回は「${proposal.inputTheme}」は見送りになったよ。また素敵なお題を待ってるね。`,
        `"${proposal.inputTheme}" was not selected this time, but I would love to see more ideas from you.`,
      )
    default:
      return t(
        "いいねを集めると採用されやすくなるよ。内容が近い案なら、いいねの多いほうを選ぶね。",
        "More likes help. When ideas are close, I pick the one with more likes.",
      )
  }
}
