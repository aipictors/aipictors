import { gql, useQuery as useApolloQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Boxes, ImageOff, Lock, LockOpen } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
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
import { Badge } from "~/components/ui/badge"
import { Button, buttonVariants } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Textarea } from "~/components/ui/textarea"
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import { UserModelAuthor } from "~/components/user-models/user-model-author"
import { AuthContext } from "~/contexts/auth-context"
import {
  fetchUserModelReports,
  moderateUserModel,
} from "~/lib/user-models/client"
import {
  baseModelLabel,
  kindLabel,
  ratingLabel,
  reportReasonLabel,
} from "~/lib/user-models/constants"
import type {
  UserModelModerationAction,
  UserModelReportSummary,
  UserModelStatus,
} from "~/lib/user-models/types"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "モデル通報",
      enTitle: "Reported Models",
      description: "通報されたみんなのモデルを確認するページ",
      enDescription: "Moderator-only page for reviewing reported user models",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const pageTitle = "モデル通報"

const pageDescription =
  "利用者から通報された LoRA・チェックポイントを確認し、必要に応じて非公開にします。"

const reportsQueryKey = [...userModelsQueryKeys.all, "admin-reports"] as const

const toStatusText = (status: UserModelStatus) => {
  switch (status) {
    case "READY":
      return "公開中"
    case "DISABLED":
      return "非公開"
    case "UPLOADING":
      return "アップロード中"
    case "DELETED":
      return "削除済み"
    default:
      return status
  }
}

export default function AdminUserModelsPage() {
  const authContext = useContext(AuthContext)
  const { data: viewerData, loading: viewerLoading } = useApolloQuery(
    viewerQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )
  const isModerator = viewerData?.viewer?.isModerator === true

  const reportsQuery = useQuery({
    queryKey: reportsQueryKey,
    enabled: isModerator,
    queryFn: () => fetchUserModelReports({ offset: 0, limit: 100 }),
  })

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title={pageTitle}
        description={pageDescription}
        icon={Boxes}
      >
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-slate-400 text-sm">
            読み込み中...
          </CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell
        title={pageTitle}
        description={pageDescription}
        icon={Boxes}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  if (!isModerator) {
    return (
      <AdminPageShell
        title={pageTitle}
        description={pageDescription}
        icon={Boxes}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  const reports = reportsQuery.data?.reports ?? []

  return (
    <AdminPageShell
      title={pageTitle}
      description={pageDescription}
      icon={Boxes}
    >
      {reportsQuery.isLoading ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-slate-400 text-sm">
            読み込み中...
          </CardContent>
        </Card>
      ) : reportsQuery.error ? (
        <Alert className="rounded-[28px] border-rose-400/30 bg-rose-500/10 text-slate-100">
          <AlertDescription className="text-rose-100">
            {reportsQuery.error instanceof Error
              ? reportsQuery.error.message
              : "通報一覧の取得に失敗しました"}
          </AlertDescription>
        </Alert>
      ) : reports.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-slate-400 text-sm">
            表示するモデル通報はありません。
          </CardContent>
        </Card>
      ) : (
        reports.map((report) => (
          <ReportedModelCard key={report.model.id} report={report} />
        ))
      )}
    </AdminPageShell>
  )
}

function ReportedModelCard(props: { report: UserModelReportSummary }) {
  const queryClient = useQueryClient()
  const { report } = props
  const model = report.model
  const [reason, setReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const isDisabled = report.status === "DISABLED"
  const isDeleted = report.status === "DELETED"

  const onModerate = async (action: UserModelModerationAction) => {
    setIsUpdating(true)
    try {
      await moderateUserModel({
        modelId: model.id,
        action,
        reason: action === "disable" ? reason.trim() || undefined : undefined,
      })
      toast.success(
        action === "disable"
          ? `「${model.name}」を非公開にしました`
          : `「${model.name}」を公開に戻しました`,
      )
      setReason("")
      await queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "モデルの更新に失敗しました",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
            {model.thumbnailUrl ? (
              <img
                src={model.thumbnailUrl}
                alt={model.name}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <ImageOff className="size-6 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="break-all text-base">
              <Link
                to={`/models/u/${model.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:underline"
              >
                {model.name || "(名前なし)"}
              </Link>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs">
              <span>モデルID: {model.id}</span>
              <span className="flex items-center gap-1">
                作者:
                <UserModelAuthor
                  userId={model.userId}
                  user={model.user}
                  linked
                  className="text-slate-200"
                />
              </span>
              <span>
                {kindLabel(model.kind)} / {baseModelLabel(model.baseModel)} /{" "}
                {ratingLabel(model.rating)}
              </span>
              <span>通報件数: {report.reportCount}</span>
              {report.lastReportedAt ? (
                <span>
                  最新通報: {toDateTimeText(report.lastReportedAt, true)}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={isDisabled || isDeleted ? "destructive" : "secondary"}
                className={
                  isDisabled || isDeleted
                    ? undefined
                    : "bg-emerald-500/15 text-emerald-100"
                }
              >
                {toStatusText(report.status)}
              </Badge>
              {report.reasons.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="bg-white/10 text-slate-100"
                >
                  {reportReasonLabel(item)}
                </Badge>
              ))}
            </div>
            {report.disabledReason ? (
              <p className="text-rose-200/80 text-xs">
                非公開の理由: {report.disabledReason}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isDeleted ? (
          <p className="text-slate-400 text-sm">
            作者が削除したモデルのため、操作は不要です。
          </p>
        ) : isDisabled ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-sky-400/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"
                disabled={isUpdating}
              >
                <LockOpen className="mr-2 size-4" />
                {isUpdating ? "処理中..." : "公開に戻す"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
              <AlertDialogHeader>
                <AlertDialogTitle>モデルを公開に戻す</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  「{model.name}
                  」を公開に戻し、ふたたび一覧と生成で使えるようにします。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                  キャンセル
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onModerate("enable")}
                  className={[
                    buttonVariants({ variant: "default" }),
                    "bg-sky-500 text-slate-950 hover:bg-sky-400",
                  ].join(" ")}
                >
                  公開に戻す
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              placeholder="非公開の理由（任意・記録用）"
              className="border-white/10 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-rose-600 text-white hover:bg-rose-500"
                  disabled={isUpdating}
                >
                  <Lock className="mr-2 size-4" />
                  {isUpdating ? "処理中..." : "非公開にする"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>モデルを非公開にする</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    「{model.name}
                    」を非公開にします。一覧に表示されなくなり、生成にも使えなくなります。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                    キャンセル
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onModerate("disable")}
                    className={[
                      buttonVariants({ variant: "destructive" }),
                      "bg-rose-600 hover:bg-rose-500",
                    ].join(" ")}
                  >
                    非公開にする
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const viewerQuery = gql`
  query AdminUserModelsViewer {
    viewer {
      id
      isModerator
    }
  }
`
