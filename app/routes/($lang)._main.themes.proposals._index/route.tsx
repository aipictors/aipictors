import { gql, useMutation, useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
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
}

type QueryData = {
  themeProposals: ThemeProposal[]
}

export default function ThemeProposalsPage() {
  const t = useTranslation()
  const { data, loading, refetch } = useQuery<QueryData>(ThemeProposalsQuery, {
    variables: { offset: 0, limit: 100 },
    fetchPolicy: "cache-and-network",
  })
  const [cancelProposal, { loading: isCanceling }] = useMutation(
    CancelThemeProposalMutation,
  )
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)

  const proposals = data?.themeProposals ?? []

  const onCancel = async (proposalId: string) => {
    await cancelProposal({ variables: { proposalId: proposalId } })
    toast(t("提案を取り消しました", "Canceled the proposal"))
    setPendingCancelId(null)
    void refetch()
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

      {loading && proposals.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2Icon className="mr-2 animate-spin" />
          {t("読み込み中", "Loading")}
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => {
            const targetDate = new Date(`${proposal.targetDate}T00:00:00`)

            return (
              <div key={proposal.id} className="grid gap-3 md:grid-cols-[108px_1fr] md:items-start">
                <div className="flex flex-col items-center gap-2 pt-3 text-center">
                  <Link
                    to={`/users/${proposal.proposerUserId}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <Avatar className="size-16 border-4 border-white shadow-md">
                      <AvatarImage
                        src={proposal.proposerIconUrl ?? ""}
                        alt={proposal.proposerName}
                      />
                      <AvatarFallback>
                        {proposal.proposerName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-muted-foreground text-[11px]">
                        {t("提案者", "Proposer")}
                      </p>
                      <p className="font-medium text-sm">{proposal.proposerName}</p>
                    </div>
                  </Link>
                </div>

                <div className="relative rounded-[28px] border border-orange-200 bg-linear-to-br from-white via-orange-50/70 to-amber-100/70 p-5 shadow-sm">
                  <div className="absolute top-8 left-[-7px] h-4 w-4 rotate-45 border-orange-200 border-b border-l bg-orange-50" />

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getStatusBadgeClassName(proposal.status)}>
                            {getStatusLabel(t, proposal.status)}
                          </Badge>
                          <Badge variant="secondary">
                            {format(targetDate, "yyyy/MM/dd (EEE)", { locale: ja })}
                          </Badge>
                        </div>
                        <div className="rounded-[24px] bg-white/80 p-4 shadow-sm">
                          <p className="font-semibold text-lg leading-7">{proposal.inputTheme}</p>
                          <p className="mt-2 text-muted-foreground text-sm">
                            {proposal.title}
                            {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
                          </p>
                        </div>
                      </div>

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

                    <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-[1fr_220px]">
                      <div className="rounded-2xl border bg-white/80 p-3">
                        <p className="text-muted-foreground text-xs">Prompt</p>
                        <p className="mt-1">{proposal.promptName}</p>
                      </div>
                      <div className="rounded-2xl border bg-white/80 p-3">
                        <p className="text-muted-foreground text-xs">
                          {t("送信日時", "Submitted")}
                        </p>
                        <p className="mt-1">{formatUnixTime(proposal.createdAt)}</p>
                      </div>
                    </div>

                    {proposal.precheckComment && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm">
                        <p className="mb-1 font-medium">
                          {t("一次チェック", "Initial check")}
                        </p>
                        <p>{proposal.precheckComment}</p>
                      </div>
                    )}

                    {proposal.decisionComment && (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sky-900 text-sm">
                        <p className="mb-1 font-medium">
                          {t("ぴくたーちゃんのコメント", "Pictor-chan comment")}
                        </p>
                        <p>{proposal.decisionComment}</p>
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
