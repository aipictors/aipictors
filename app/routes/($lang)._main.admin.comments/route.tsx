import { useMutation, useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useContext, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useToast } from "~/hooks/use-toast"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { Shield, Flag, MessageSquareWarning } from "lucide-react"

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

export default function AdminCommentsPage() {
  const { toast } = useToast()
  const authContext = useContext(AuthContext)
  const [processingCommentId, setProcessingCommentId] = useState<string | null>(
    null,
  )
  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
  })
  const { data, loading } = useQuery(adminCommentModerationItemsQuery, {
    skip: authContext.isNotLoggedIn || !viewerData?.viewer?.isModerator,
  })
  const [reviewCommentModeration] = useMutation(reviewCommentModerationMutation)

  const onModerate = async (
    commentId: string,
    action: "APPROVE" | "REJECT" | "REQUEUE",
  ) => {
    setProcessingCommentId(commentId)

    try {
      await reviewCommentModeration({
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
        refetchQueries: [{ query: adminCommentModerationItemsQuery }],
        awaitRefetchQueries: true,
      })

      toast({
        title: "更新しました",
        description: `comment #${commentId} を ${action} に設定しました。`,
      })
    } catch (error) {
      toast({
        title: "操作に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーです。",
      })
    } finally {
      setProcessingCommentId(null)
    }
  }

  if (authContext.isLoading || viewerLoading) {
    return <div className="container mx-auto max-w-5xl py-8" />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスするにはログインが必要です。</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!viewerData?.viewer?.isModerator) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスする権限がありません。</AlertDescription>
        </Alert>
      </div>
    )
  }

  const items = data?.adminCommentModerationItems ?? []

  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-8">
      <div className="flex items-center gap-2">
        <Shield className="size-6 text-orange-500" />
        <h1 className="font-bold text-2xl">コメント審査</h1>
        <Badge variant="secondary">noindex</Badge>
      </div>
      <Separator />
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            対応待ちのコメント報告・異議申し立てはありません。
          </CardContent>
        </Card>
      ) : (
        items.map((item: any) => (
          <Card key={item.id}>
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
                <Badge variant="outline">comment #{item.commentId}</Badge>
                {item.moderationStatus && (
                  <Badge variant="secondary">{item.moderationStatus}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md bg-muted p-3 whitespace-pre-wrap break-words">
                {item.commentText}
              </div>
              <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
                <span>作成: {toDateTimeText(item.commentCreatedAt, true)}</span>
                <span>投稿者: {item.commentOwnerName ?? "-"}</span>
                <span>login: {item.commentOwnerLogin ?? "-"}</span>
                <span>work: {item.workTitle ?? "-"}</span>
                <span>open reports: {item.reportCount}</span>
              </div>
              {item.reportReason && (
                <div className="text-xs">理由: {item.reportReason}</div>
              )}
              {item.violationCategory && (
                <div className="text-xs">判定カテゴリ: {item.violationCategory}</div>
              )}
              {item.userNotice && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs">
                  ユーザー表示メモ: {item.userNotice}
                </div>
              )}
              {item.details && (
                <div className="rounded-md border p-3 whitespace-pre-wrap break-words text-xs">
                  {item.details}
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                受付日時: {toDateTimeText(item.createdAt, true)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  disabled={processingCommentId === String(item.commentId)}
                  onClick={() => onModerate(String(item.commentId), "APPROVE")}
                >
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={processingCommentId === String(item.commentId)}
                  onClick={() => onModerate(String(item.commentId), "REQUEUE")}
                >
                  差し戻し
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={processingCommentId === String(item.commentId)}
                  onClick={() => onModerate(String(item.commentId), "REJECT")}
                >
                  却下
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
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