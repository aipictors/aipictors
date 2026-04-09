import { gql, useMutation, useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Heart, Loader2Icon } from "lucide-react"
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
  precheckComment?: string | null
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
            "保留中のお題案にはログインユーザーがいいねできます。採用判定ではAIが内容に加えていいね数も参考にし、近い案ならいいねが多い案を優先します。",
            "Signed-in users can like pending theme proposals. Adoption AI now considers likes as well, and will prefer higher-liked proposals when ideas are similarly strong.",
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
        <div className="grid gap-3">
          {proposals.map((proposal) => {
            const targetDate = new Date(`${proposal.targetDate}T00:00:00`)
            const isOwnProposal = authContext.userId === proposal.proposerUserId
            const canLikeProposal =
              authContext.isLoggedIn &&
              !isOwnProposal &&
              proposal.status === "PENDING"
            const isLikeBusy = pendingLikeId === proposal.id

            return (
              <div key={proposal.id} className="grid gap-2 md:grid-cols-[84px_1fr] md:items-start">
                <div className="flex flex-col items-center gap-1 pt-1 text-center">
                  <Link
                    to={`/users/${proposal.proposerUserId}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <Avatar className="size-12 border-2 border-white shadow-sm">
                      <AvatarImage
                        src={proposal.proposerIconUrl ?? ""}
                        alt={proposal.proposerName}
                      />
                      <AvatarFallback>
                        {proposal.proposerName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-muted-foreground text-[10px] leading-none">
                        {t("提案者", "Proposer")}
                      </p>
                      <p className="mt-1 line-clamp-2 font-medium text-xs leading-4">
                        {proposal.proposerName}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="relative rounded-[22px] border border-orange-200 bg-linear-to-br from-white via-orange-50/70 to-amber-100/70 p-3 shadow-sm dark:border-orange-800 dark:from-zinc-900 dark:via-orange-950/40 dark:to-amber-950/30 dark:text-zinc-100">
                  <div className="absolute top-6 left-[-6px] h-3 w-3 rotate-45 border-orange-200 border-b border-l bg-orange-50 dark:border-orange-800 dark:bg-orange-950/80" />

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={getStatusBadgeClassName(proposal.status)}>
                            {getStatusLabel(t, proposal.status)}
                          </Badge>
                          <Badge variant="secondary" className="px-2 py-0 text-[11px]">
                            {format(targetDate, "yyyy/MM/dd (EEE)", { locale: ja })}
                          </Badge>
                          <Badge variant="outline" className="gap-1 bg-white/80 px-2 py-0 text-[11px] dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100">
                            <Heart
                              className={proposal.isLiked ? "size-3.5 fill-rose-500 text-rose-500" : "size-3.5"}
                            />
                            <span>{proposal.likesCount}</span>
                          </Badge>
                          <span className="text-muted-foreground text-xs dark:text-zinc-400">
                            {t("送信", "Submitted")}: {formatUnixTime(proposal.createdAt)}
                          </span>
                        </div>
                        <div className="rounded-[18px] bg-white/85 px-3 py-2.5 shadow-sm dark:bg-zinc-900/75">
                          <p className="font-semibold text-base leading-6 dark:text-zinc-50">{proposal.inputTheme}</p>
                          <p className="mt-1 text-muted-foreground text-xs leading-5 dark:text-zinc-400">
                            {proposal.title}
                            {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-muted-foreground dark:text-zinc-400">
                            <span className="font-medium text-foreground/80 dark:text-zinc-200">Prompt:</span>{" "}
                            {proposal.promptName}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        {canLikeProposal && (
                          <Button
                            variant={proposal.isLiked ? "default" : "outline"}
                            size="sm"
                            disabled={isLikeBusy}
                            onClick={() => onToggleLike(proposal)}
                            className="gap-2"
                          >
                            {isLikeBusy ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <Heart
                                className={proposal.isLiked ? "size-4 fill-current" : "size-4"}
                              />
                            )}
                            <span>
                              {proposal.isLiked
                                ? t("いいね解除", "Unlike")
                                : t("いいね", "Like")}
                            </span>
                          </Button>
                        )}

                        {proposal.canCancel && (
                          <AlertDialog
                            open={pendingCancelId === proposal.id}
                            onOpenChange={(open) => {
                              setPendingCancelId(open ? proposal.id : null)
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
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
                      </div>
                    </div>

                    {proposal.precheckComment && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900 text-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                        <p className="mb-1 font-medium text-xs uppercase tracking-wide dark:text-emerald-200">
                          {t("一次チェック", "Initial check")}
                        </p>
                        <p className="leading-6">{proposal.precheckComment}</p>
                      </div>
                    )}

                    {proposal.decisionComment && (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900 text-sm dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100">
                        <p className="mb-1 font-medium text-xs uppercase tracking-wide dark:text-sky-200">
                          {t("ぴくたーちゃんのコメント", "Pictor-chan comment")}
                        </p>
                        <p className="leading-6">{proposal.decisionComment}</p>
                      </div>
                    )}

                    {proposal.status === "ADOPTED" && proposal.adoptedSubjectId && (
                      <div>
                        <Button asChild variant="secondary" size="sm">
                          <Link
                            to={`/themes/${proposal.targetDate.slice(0, 4)}/${Number(proposal.targetDate.slice(5, 7))}/${Number(proposal.targetDate.slice(8, 10))}`}
                          >
                            {t("採用されたお題を見る", "Open adopted theme")}
                          </Link>
                        </Button>
                      </div>
                    )}
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
      precheckComment
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
