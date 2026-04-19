import { useMutation, useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { useContext, useMemo, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { AdminPageShell } from "~/components/admin-page-shell"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { Flag, MessageSquareWarning } from "lucide-react"
import { toast } from "sonner"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "コメント審査",
      enTitle: "Comment Moderation",
      description: "コメント報告と異議申し立ての確認ページ",
      enDescription: "Moderator-only page for comment reports and appeals",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const pageDescription = "コメント通報と異議申し立ての確認・対応を行います。"

export default function AdminCommentsPage() {
  const authContext = useContext(AuthContext)
  const [processingItemId, setProcessingItemId] = useState<string | null>(
    null,
  )
  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const { data, loading, refetch } = useQuery(adminCommentModerationItemsQuery, {
    skip:
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      !viewerData?.viewer?.isModerator,
    fetchPolicy: "network-only",
  })
  const [reviewCommentModeration] = useMutation(reviewCommentModerationMutation)

  const items = useMemo(() => {
    return data?.adminCommentModerationItems ?? []
  }, [data])

  const onModerate = async (
    itemId: string,
    kind: "REPORT" | "APPEAL",
    commentId: string,
    action: "APPROVE" | "REJECT" | "REQUEUE",
  ) => {
    setProcessingItemId(itemId)

    try {
      const result = await reviewCommentModeration({
        variables: {
          input: {
            commentId,
            action,
            violationCategory: action === "REJECT" ? "OTHER" : null,
            userNotice:
              action === "REJECT"
                ? "コミュニティガイドラインに違反する可能性があるため非表示です。"
                : null,
          },
        },
      })

      if (result.data?.reviewCommentModeration !== true) {
        throw new Error("更新に失敗しました。")
      }

      await refetch()

      toast.success(`${toActionText(kind, action)}に更新しました`) 
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "不明なエラーです。")
    } finally {
      setProcessingItemId(null)
    }
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title="コメント審査"
        description={pageDescription}
        icon={MessageSquareWarning}
      >
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell
        title="コメント審査"
        description={pageDescription}
        icon={MessageSquareWarning}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  if (!viewerData?.viewer?.isModerator) {
    return (
      <AdminPageShell
        title="コメント審査"
        description={pageDescription}
        icon={MessageSquareWarning}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell
      title="コメント審査"
      description={pageDescription}
      icon={MessageSquareWarning}
    >
      {loading ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            対応待ちのコメント報告・異議申し立てはありません。
          </CardContent>
        </Card>
      ) : (
        items.map((item: any) => (
          <Card key={item.id} className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                {item.kind === "REPORT" ? (
                  <Flag className="size-4 text-rose-500" />
                ) : (
                  <MessageSquareWarning className="size-4 text-amber-500" />
                )}
                <CardTitle className="text-base">
                  {item.kind === "REPORT" ? "コメント報告" : "異議申し立て"}
                </CardTitle>
                <Badge variant="outline" className="border-white/20 bg-slate-950/50 text-slate-100">
                  comment #{item.commentId}
                </Badge>
                {item.moderationStatus && (
                  <Badge variant="secondary" className="bg-white/10 text-slate-200">
                    {toModerationStatusText(item.moderationStatus)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 whitespace-pre-wrap break-words text-slate-100">
                {item.commentText}
              </div>
              <div className="flex flex-wrap gap-3 text-slate-400 text-xs">
                <span>作成: {toDateTimeText(item.commentCreatedAt, true)}</span>
                <span>投稿者: {item.commentOwnerName ?? "-"}</span>
                <span>login: {item.commentOwnerLogin ?? "-"}</span>
                <span>work: {item.workTitle ?? "-"}</span>
                <span>未解決通報: {item.reportCount}</span>
              </div>
              {item.reportReason && (
                <div className="text-xs text-slate-300">理由: {item.reportReason}</div>
              )}
              {item.violationCategory && (
                <div className="text-xs text-slate-300">判定カテゴリ: {item.violationCategory}</div>
              )}
              {item.userNotice && (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-xs text-amber-100">
                  ユーザー表示メモ: {item.userNotice}
                </div>
              )}
              {item.details && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 whitespace-pre-wrap break-words text-xs text-slate-300">
                  {item.details}
                </div>
              )}
              <div className="text-slate-400 text-xs">
                受付日時: {toDateTimeText(item.createdAt, true)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  disabled={processingItemId === item.id}
                  onClick={() => onModerate(item.id, item.kind, String(item.commentId), "APPROVE")}
                >
                  {toActionText(item.kind, "APPROVE")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 text-slate-100 hover:bg-white/20"
                  disabled={processingItemId === item.id}
                  onClick={() => onModerate(item.id, item.kind, String(item.commentId), "REQUEUE")}
                >
                  {toActionText(item.kind, "REQUEUE")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-rose-600 text-white hover:bg-rose-500"
                  disabled={processingItemId === item.id}
                  onClick={() => onModerate(item.id, item.kind, String(item.commentId), "REJECT")}
                >
                  {toActionText(item.kind, "REJECT")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </AdminPageShell>
  )
}

const toModerationStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "審査待ち"
    case "APPROVED":
      return "問題なし"
    case "REJECTED":
      return "非表示"
    default:
      return status
  }
}

const toActionText = (
  kind: "REPORT" | "APPEAL",
  action: "APPROVE" | "REJECT" | "REQUEUE",
) => {
  if (kind === "APPEAL") {
    switch (action) {
      case "APPROVE":
        return "再表示"
      case "REJECT":
        return "非表示のまま"
      case "REQUEUE":
        return "審査待ちに戻す"
    }
  }

  switch (action) {
    case "APPROVE":
      return "問題なし"
    case "REJECT":
      return "非表示"
    case "REQUEUE":
      return "審査待ちに戻す"
  }
}

const viewerQuery = gql`
  query AdminCommentsViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminCommentModerationItemsQuery = gql`
  query AdminCommentModerationItems {
    adminCommentModerationItems {
      id
      kind
      commentId
      commentText
      commentCreatedAt
      commentOwnerName
      commentOwnerLogin
      workTitle
      reportReason
      details
      createdAt
      moderationStatus
      violationCategory
      userNotice
      reportCount
    }
  }
`

const reviewCommentModerationMutation = gql`
  mutation ReviewCommentModeration($input: ReviewCommentModerationInput!) {
    reviewCommentModeration(input: $input)
  }
`