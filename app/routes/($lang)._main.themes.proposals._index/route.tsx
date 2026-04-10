import { gql, useMutation, useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronDown, ChevronUp, Heart, Loader2Icon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AppPageHeader } from "~/components/app/app-page-header"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
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
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type ThemeProposal = {
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
  decisionComment?: string | null
  createdAt: number
  updatedAt: number
  decidedAt?: number | null
  adoptedSubjectId?: string | null
  canCancel: boolean
  likesCount: number
  isLiked: boolean
}

type QueryData = {
  themeProposals: ThemeProposal[]
}

const PICTOR_CHAN_ICON_URL =
  "https://assets.aipictors.com/pictorchan-icon_11zon.webp"

export default function ThemeProposalsPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { data, loading, refetch } = useQuery<QueryData>(ThemeProposalsQuery, {
    variables: { offset: 0, limit: 100 },
    fetchPolicy: "cache-and-network",
  })
  const [cancelProposal, { loading: isCanceling }] = useMutation(
    CancelThemeProposalMutation,
  )
  const [createThemeProposalLike] = useMutation(CreateThemeProposalLikeMutation)
  const [deleteThemeProposalLike] = useMutation(DeleteThemeProposalLikeMutation)
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null)
  const [expandedProposalIds, setExpandedProposalIds] = useState<string[]>([])

  const proposals = (data?.themeProposals ?? []).filter(
    (proposal) => proposal.status !== "CANCELED",
  )

  const onCancel = async (proposalId: string) => {
    await cancelProposal({ variables: { proposalId: proposalId } })
    toast(t("提案を取り消しました", "Canceled the proposal"))
    setPendingCancelId(null)
    void refetch()
  }

  const onToggleLike = async (proposal: ThemeProposal) => {
    setPendingLikeId(proposal.id)

    try {
      if (proposal.isLiked) {
        await deleteThemeProposalLike({ variables: { proposalId: proposal.id } })
      } else {
        await createThemeProposalLike({ variables: { proposalId: proposal.id } })
      }

      void refetch()
    } finally {
      setPendingLikeId(null)
    }
  }

  const onToggleExpanded = (proposalId: string) => {
    setExpandedProposalIds((current) => {
      if (current.includes(proposalId)) {
        return current.filter((id) => id !== proposalId)
      }

      return [...current, proposalId]
    })
  }

  return (
    <div className="space-y-4">
      <AppPageHeader
        title={t("お題提案一覧", "Theme proposals")}
        description={t(
          "送られたお題提案と、ぴくたーちゃんの採用コメントを確認できます。",
          "Browse submitted theme proposals and Pictor-chan's adoption comments.",
        )}
      />

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/themes/proposals/new">
            {t("お題を提案する", "Submit a proposal")}
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-950 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100">
        <p className="font-medium dark:text-orange-100">
          {t(
            "保留中のお題案にはログインユーザーがいいねできます。採用判定では X (Grok) が内容に加えていいね数も参考にし、近い案ならいいねが多い案を優先します。",
            "Signed-in users can like pending theme proposals. X (Grok) also considers likes and will prefer higher-liked proposals when ideas are similarly strong.",
          )}
        </p>
        <p className="mt-1 text-xs text-orange-800 dark:text-orange-200/80">
          {t(
            "公平性のため、自分の提案にはいいねできません。",
            "For fairness, you cannot like your own proposal.",
          )}
        </p>
      </div>

      {loading && proposals.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2Icon className="mr-2 animate-spin" />
          {t("読み込み中", "Loading")}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {proposals.map((proposal) => {
            const targetDate = new Date(`${proposal.targetDate}T00:00:00`)
            const isOwnProposal = authContext.userId === proposal.proposerUserId
            const canLikeProposal =
              authContext.isLoggedIn &&
              !isOwnProposal &&
              proposal.status === "PENDING"
            const isLikeBusy = pendingLikeId === proposal.id
            const isExpanded = expandedProposalIds.includes(proposal.id)
            const previewMessage = getPictorPreviewMessage(t, proposal)

            return (
              <div key={proposal.id} className="grid gap-2 md:grid-cols-[88px_1fr] md:items-start">
                <div className="flex flex-col items-center gap-2 pt-1 text-center">
                  <Link to="/pictor-chan" className="flex flex-col items-center gap-2">
                    <Avatar className="size-14 border-2 border-white bg-white shadow-md ring-4 ring-orange-100 dark:border-zinc-900 dark:bg-zinc-900 dark:ring-orange-950/40">
                      <AvatarImage src={PICTOR_CHAN_ICON_URL} alt={t("ぴくたーちゃん", "Pictor-chan")} />
                      <AvatarFallback>ぴ</AvatarFallback>
                    </Avatar>
                    <div className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-orange-900 dark:bg-orange-950/60 dark:text-orange-100">
                      {t("ぴくたーちゃん", "Pictor-chan")}
                    </div>
                  </Link>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleExpanded(proposal.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      onToggleExpanded(proposal.id)
                    }
                  }}
                  className="group relative rounded-[24px] border border-orange-200 bg-linear-to-br from-white via-orange-50/85 to-amber-100/75 p-3 shadow-sm transition hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 dark:border-orange-800 dark:from-zinc-900 dark:via-orange-950/40 dark:to-amber-950/30 dark:text-zinc-100 dark:hover:border-orange-700"
                >
                  <div className="absolute top-7 left-[-6px] h-3 w-3 rotate-45 border-orange-200 border-b border-l bg-orange-50 dark:border-orange-800 dark:bg-orange-950/80" />

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="px-2 py-0 text-[11px]">
                            {format(targetDate, "yyyy/MM/dd (EEE)", { locale: ja })}
                          </Badge>
                          <Badge className={getStatusBadgeClassName(proposal.status)}>
                            {getStatusLabel(t, proposal.status)}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground dark:text-zinc-400">
                            {t("吹き出しをクリックで詳細", "Click the bubble for details")}
                          </span>
                        </div>

                        <p className="pr-2 text-sm leading-6 font-medium text-foreground/90 dark:text-zinc-50">
                          {previewMessage}
                        </p>

                        <div className="inline-flex max-w-full items-center rounded-[18px] border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50">
                          <span className="truncate">「{proposal.inputTheme}」</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-start">
                        <Button
                          variant={proposal.isLiked ? "default" : "outline"}
                          size="sm"
                          disabled={!canLikeProposal || isLikeBusy}
                          onClick={(event) => {
                            event.stopPropagation()
                            void onToggleLike(proposal)
                          }}
                          className="h-8 gap-1.5 rounded-full px-2.5"
                          title={
                            canLikeProposal
                              ? proposal.isLiked
                                ? t("いいね解除", "Unlike")
                                : t("いいね", "Like")
                              : isOwnProposal
                                ? t("自分の提案にはいいねできません", "You cannot like your own proposal")
                                : t("保留中の提案のみいいねできます", "Only pending proposals can be liked")
                          }
                        >
                          {isLikeBusy ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <Heart
                              className={proposal.isLiked ? "size-3.5 fill-current" : "size-3.5"}
                            />
                          )}
                          <span className="text-[11px]">{proposal.likesCount}</span>
                        </Button>

                        <div className="flex size-8 items-center justify-center rounded-full border border-orange-200 bg-white/80 text-orange-700 shadow-sm transition group-hover:border-orange-300 dark:border-orange-800 dark:bg-zinc-900/70 dark:text-orange-200">
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t border-orange-200/70 pt-3 dark:border-orange-900/80">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="flex items-center gap-3 rounded-[18px] border border-white/70 bg-white/80 px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/75">
                              <Link
                                to={`/users/${proposal.proposerUserId}`}
                                className="shrink-0"
                                onClick={(event) => {
                                  event.stopPropagation()
                                }}
                              >
                                <Avatar className="size-10 border border-white shadow-sm dark:border-zinc-700">
                                  <AvatarImage
                                    src={withIconUrlFallback(proposal.proposerIconUrl)}
                                    alt={proposal.proposerName}
                                  />
                                  <AvatarFallback>
                                    {proposal.proposerName.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground dark:text-zinc-400">
                                  {t("提案者", "Proposer")}
                                </p>
                                <Link
                                  to={`/users/${proposal.proposerUserId}`}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                  }}
                                  className="line-clamp-1 font-medium text-foreground hover:underline dark:text-zinc-100"
                                >
                                  {proposal.proposerName}
                                </Link>
                              </div>
                            </div>

                            <div className="rounded-[18px] bg-white/85 px-3 py-3 shadow-sm dark:bg-zinc-900/75">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-muted-foreground text-xs dark:text-zinc-400">
                                  {t("送信", "Submitted")}: {formatUnixTime(proposal.createdAt)}
                                </span>
                                {proposal.decidedAt && (
                                  <span className="text-muted-foreground text-xs dark:text-zinc-400">
                                    {t("判定", "Decided")}: {formatUnixTime(proposal.decidedAt)}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-[12px] leading-5 text-muted-foreground dark:text-zinc-300">
                                {proposal.title}
                                {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
                              </p>
                              <p className="mt-1 text-[12px] leading-5 text-muted-foreground dark:text-zinc-300">
                                <span className="font-medium text-foreground/80 dark:text-zinc-100">Prompt:</span>{" "}
                                {proposal.promptName}
                              </p>
                            </div>

                            {proposal.decisionComment && (
                              <div className="rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100">
                                <p className="mb-1 font-medium text-[11px] uppercase tracking-wide dark:text-sky-200">
                                  {t("ぴくたーちゃんのコメント", "Pictor-chan comment")}
                                </p>
                                <p className="leading-6">{proposal.decisionComment}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                            {proposal.canCancel && (
                              <AlertDialog
                                open={pendingCancelId === proposal.id}
                                onOpenChange={(open) => {
                                  setPendingCancelId(open ? proposal.id : null)
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                    }}
                                  >
                                    {t("取り消す", "Cancel")}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t("提案を取り消しますか？", "Cancel this proposal?")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(
                                        "保留中の提案だけ取り消せます。",
                                        "Only pending proposals can be canceled.",
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {t("戻る", "Back")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onCancel(proposal.id)}
                                      disabled={isCanceling}
                                    >
                                      {isCanceling ? t("処理中", "Working") : t("取り消す", "Cancel")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {proposal.status === "ADOPTED" && proposal.adoptedSubjectId && (
                              <Button
                                asChild
                                variant="secondary"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation()
                                }}
                              >
                                <Link
                                  to={`/themes/${proposal.targetDate.slice(0, 4)}/${Number(proposal.targetDate.slice(5, 7))}/${Number(proposal.targetDate.slice(8, 10))}`}
                                >
                                  {t("採用されたお題を見る", "Open adopted theme")}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatUnixTime(value: number) {
  return format(new Date(value * 1000), "yyyy/MM/dd HH:mm")
}

function getStatusLabel(
  t: ReturnType<typeof useTranslation>,
  status: string,
) {
  switch (status) {
    case "ADOPTED":
      return t("採用", "Adopted")
    case "REJECTED":
      return t("不採用", "Rejected")
    case "CANCELED":
      return t("取り消し", "Canceled")
    default:
      return t("保留中", "Pending")
  }
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "ADOPTED":
      return "bg-emerald-600 text-white"
    case "REJECTED":
      return "bg-slate-600 text-white"
    case "CANCELED":
      return "bg-rose-600 text-white"
    default:
      return "bg-amber-500 text-white"
  }
}

function getPictorPreviewMessage(
  t: ReturnType<typeof useTranslation>,
  proposal: ThemeProposal,
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
        `「${proposal.inputTheme}」はどうかな？ いいねが多い提案ほど採用されやすいよ。`,
        `How about "${proposal.inputTheme}"? Proposals with more likes are more likely to be adopted.`,
      )
  }
}

const ThemeProposalsQuery = gql`
  query ThemeProposals($offset: Int!, $limit: Int!) {
    themeProposals(offset: $offset, limit: $limit) {
      id
      title
      enTitle
      promptName
      inputTheme
      targetDate
      status
      proposerUserId
      proposerName
      proposerIconUrl
      decisionComment
      createdAt
      updatedAt
      decidedAt
      adoptedSubjectId
      canCancel
      likesCount
      isLiked
    }
  }
`

const CancelThemeProposalMutation = gql`
  mutation CancelThemeProposal($proposalId: ID!) {
    cancelThemeProposal(proposalId: $proposalId) {
      id
      status
    }
  }
`

const CreateThemeProposalLikeMutation = gql`
  mutation CreateThemeProposalLike($proposalId: ID!) {
    createThemeProposalLike(proposalId: $proposalId) {
      id
      likesCount
      isLiked
    }
  }
`

const DeleteThemeProposalLikeMutation = gql`
  mutation DeleteThemeProposalLike($proposalId: ID!) {
    deleteThemeProposalLike(proposalId: $proposalId) {
      id
      likesCount
      isLiked
    }
  }
`
