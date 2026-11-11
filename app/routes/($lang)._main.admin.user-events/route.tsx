import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Flag } from "lucide-react"
import { useContext } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"

export const meta: MetaFunction = () => [
  { title: "ユーザー主催のお題 - 管理" },
  { name: "robots", content: "noindex" },
]

const pageTitle = "ユーザー主催のお題"
const pageDescription =
  "通報されたお題・非表示にしたお題を確認します。5 人から通報されたお題は自動で非表示になり、主催者は公開に戻せません。"

type ReportedUserEvent = {
  reportCount: number
  lastReportedAt: number | null
  reasons: string[]
  event: {
    id: string
    slug: string
    title: string
    description: string | null
    mainTag: string
    status: string
    visibilityType: string
    userId: string
    userName: string | null
  }
}

const cardClass =
  "rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none"

export default function AdminUserEventsPage() {
  const authContext = useContext(AuthContext)
  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const isModerator = viewerData?.viewer?.isModerator === true

  const { data, loading, error, refetch } = useQuery<{
    reportedUserEvents: ReportedUserEvent[]
  }>(reportedUserEventsQuery, {
    skip: !isModerator,
    fetchPolicy: "network-only",
  })
  const [moderate, { loading: moderating }] = useMutation(moderateMutation)

  const onModerate = async (eventId: string, hidden: boolean) => {
    const label = hidden ? "非表示に" : "公開に戻し"
    if (!window.confirm(`このお題を${label}ます。よろしいですか？`)) return
    try {
      await moderate({ variables: { eventId, hidden } })
      toast.success(hidden ? "非表示にしました" : "公開に戻しました")
      await refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "更新に失敗しました")
    }
  }

  const body = (() => {
    if (authContext.isLoading || viewerLoading) {
      return <p className="text-slate-400 text-sm">読み込み中...</p>
    }
    if (authContext.isNotLoggedIn || !isModerator) {
      return (
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      )
    }
    if (loading) return <p className="text-slate-400 text-sm">読み込み中...</p>
    if (error) return <p className="text-rose-200 text-sm">{error.message}</p>
    const items = data?.reportedUserEvents ?? []
    if (items.length === 0) {
      return (
        <Card className={cardClass}>
          <CardContent className="py-8 text-slate-400 text-sm">
            通報されたお題はありません。
          </CardContent>
        </Card>
      )
    }
    return items.map((item) => {
      const hidden = item.event.visibilityType === "ADMIN_HIDDEN"
      return (
        <Card key={item.event.id} className={cardClass}>
          <CardContent className="space-y-2 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={hidden ? "destructive" : "secondary"}>
                {hidden ? "非表示中" : item.event.status}
              </Badge>
              <span className="text-slate-400 text-xs">
                通報 {item.reportCount} 人
                {item.lastReportedAt
                  ? `・最終 ${new Date(item.lastReportedAt * 1000).toLocaleString("ja-JP")}`
                  : ""}
              </span>
            </div>
            <p className="font-semibold">
              <Link to={`/events/${item.event.slug}`} className="hover:underline">
                {item.event.title}
              </Link>
            </p>
            <p className="text-slate-400 text-xs">
              #{item.event.mainTag} ・ 主催{" "}
              <Link to={`/users/${item.event.userId}`} className="underline">
                {item.event.userName ?? item.event.userId}
              </Link>
            </p>
            {item.event.description && (
              <p className="line-clamp-4 whitespace-pre-line text-slate-300 text-sm">
                {item.event.description.replace(/<[^>]*>/g, "")}
              </p>
            )}
            {item.reasons.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-5 text-slate-300 text-xs">
                {item.reasons.map((reason, index) => (
                  <li key={`${item.event.id}-${index}`} className="whitespace-pre-line">
                    {reason}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant={hidden ? "outline" : "destructive"}
                disabled={moderating}
                onClick={() => onModerate(item.event.id, !hidden)}
              >
                {hidden ? "公開に戻す" : "非表示にする"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    })
  })()

  return (
    <AdminPageShell title={pageTitle} description={pageDescription} icon={Flag}>
      {body}
    </AdminPageShell>
  )
}

const viewerQuery = gql`
  query AdminUserEventsViewer {
    viewer {
      id
      isModerator
    }
  }
`

const reportedUserEventsQuery = gql`
  query ReportedUserEvents {
    reportedUserEvents(limit: 100) {
      reportCount
      lastReportedAt
      reasons
      event {
        id
        slug
        title
        description
        mainTag
        status
        visibilityType
        userId
        userName
      }
    }
  }
`

const moderateMutation = gql`
  mutation ModerateUserEvent($eventId: ID!, $hidden: Boolean!) {
    moderateUserEvent(eventId: $eventId, hidden: $hidden)
  }
`
