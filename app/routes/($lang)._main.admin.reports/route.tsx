import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { useContext, useEffect, useMemo, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { AdminPageShell } from "~/components/admin-page-shell"
import {
  MODERATION_MESSAGE_TEMPLATES,
  type ModerationMessageTemplateKey,
} from "~/components/admin/moderation-message-templates"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { ImageOff, Lock, LockOpen, MessageSquareOff, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "作品通報一覧",
      enTitle: "Reported Works",
      description: "作品通報の内容と対象作品を確認するページ",
      enDescription: "Moderator-only page for reviewing reported works",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const pageDescription = "利用者から通報された作品と、その理由・詳細を確認します。"

type AdminReportItem = {
  id: string
  createdAt: number
  comment: string | null
  reason: string
  reportStatus: string
  work: {
    id: string
    title: string
    accessType: string
    adminAccessType: string
    isDeleted: boolean
    smallThumbnailImageURL: string | null
    subWorksCount: number
    thumbnailImagePosition: number | null
    smallThumbnailImageWidth: number | null
    smallThumbnailImageHeight: number | null
    user: {
      id: string
      name: string
      login: string
      isCommentBanned: boolean
      isPostBanned: boolean
    } | null
  } | null
  reportUser: {
    id: string
    name: string
    login: string
  } | null
}

type ReportGroup = {
  work: AdminReportItem["work"]
  items: AdminReportItem[]
}

const toReasonText = (reason: string) => {
  switch (reason) {
    case "AGE_MISMATCH":
      return "対象年齢が異なる"
    case "TASTE_MISMATCH":
      return "テイストが異なる"
    case "NO_MOSAIC":
      return "モザイク不足"
    case "PRIVACY_VIOLATION":
      return "プライバシー侵害"
    case "UNAUTHORIZED_REPOST":
      return "無断転載"
    case "COMMERCIAL_CONTENT":
      return "商業・宣伝目的"
    case "EXCESSIVE_GORE":
      return "過度なグロ表現"
    case "CHILD_PORNOGRAPHY":
      return "児童ポルノ懸念"
    case "ILLEGAL_CONTENT":
      return "違法コンテンツ誘導"
    case "OTHER":
      return "その他"
    default:
      return reason
  }
}

const toReportStatusText = (status: string) => {
  switch (status) {
    case "UNHANDLED":
      return "未対応"
    case "ADMIN_HANDLED":
      return "管理者対応済み"
    case "MODERATOR_HANDLED":
      return "モデレーター対応済み"
    default:
      return status
  }
}

export default function AdminReportsPage() {
  const authContext = useContext(AuthContext)
  const [showOnlyUnhandled, setShowOnlyUnhandled] = useState(true)
  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const { data, loading, refetch } = useQuery(adminWorkReportsQuery, {
    skip:
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      !viewerData?.viewer?.isModerator,
    variables: {
      offset: 0,
      limit: 120,
      onlyUnhandled: showOnlyUnhandled,
    },
    fetchPolicy: "network-only",
  })

  const reports = (data?.adminWorkReports ?? []) as AdminReportItem[]

  const groupedReports = useMemo(() => {
    const groups = new Map<string, ReportGroup>()

    for (const report of reports) {
      const key = report.work?.id ?? `missing-${report.id}`
      const current = groups.get(key)
      if (current) {
        current.items.push(report)
      } else {
        groups.set(key, { work: report.work, items: [report] })
      }
    }

    return Array.from(groups.values())
  }, [reports])

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title="作品通報一覧" description={pageDescription} icon={ShieldAlert}>
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell title="作品通報一覧" description={pageDescription} icon={ShieldAlert}>
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
      <AdminPageShell title="作品通報一覧" description={pageDescription} icon={ShieldAlert}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title="作品通報一覧" description={pageDescription} icon={ShieldAlert}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={showOnlyUnhandled ? "default" : "secondary"}
          onClick={() => setShowOnlyUnhandled(true)}
        >
          未対応のみ
        </Button>
        <Button
          size="sm"
          variant={!showOnlyUnhandled ? "default" : "secondary"}
          onClick={() => setShowOnlyUnhandled(false)}
        >
          すべて表示
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      ) : groupedReports.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            表示する作品通報はありません。
          </CardContent>
        </Card>
      ) : (
        groupedReports.map((group) => (
          <ReportedWorkGroupCard
            key={group.work?.id ?? group.items[0].id}
            group={group}
            onRefresh={async () => {
              await refetch()
            }}
          />
        ))
      )}
    </AdminPageShell>
  )
}

function ReportedWorkGroupCard(props: {
  group: ReportGroup
  onRefresh: () => Promise<unknown>
}) {
  const work = props.group.work
  const owner = work?.user ?? null
  const [templateKey, setTemplateKey] = useState<ModerationMessageTemplateKey>("EMPTY")
  const [notifyMessage, setNotifyMessage] = useState("")

  const [changeWorkSettingsWithAdmin, { loading: isUpdatingWork }] = useMutation(
    changeWorkSettingsWithAdminMutation,
  )
  const [toggleCommentBan, { loading: isCommentBanLoading }] = useMutation(
    toggleUserCommentBanMutation,
  )
  const [togglePostBan, { loading: isPostBanLoading }] = useMutation(
    toggleUserPostBanMutation,
  )

  const selectedTemplate = useMemo(
    () => MODERATION_MESSAGE_TEMPLATES.find((item) => item.key === templateKey),
    [templateKey],
  )

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }

    setNotifyMessage(selectedTemplate.text)
  }, [selectedTemplate])

  const isReachableOnPublicPostPage =
    work !== null &&
    work !== undefined &&
    !work.isDeleted &&
    work.adminAccessType === "PUBLIC" &&
    work.accessType !== "PRIVATE" &&
    work.accessType !== "DRAFT"

  const handleHideWork = async () => {
    if (!work) {
      return
    }

    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: work.id,
            accessType: "PRIVATE",
            moderationMessage: notifyMessage.trim().length > 0 ? notifyMessage.trim() : undefined,
          },
        },
      })

      toast.success(`作品 #${work.id} を非公開にしました`)
      await props.onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "作品の非公開に失敗しました")
    }
  }

  const handleRestoreWork = async () => {
    if (!work || work.isDeleted) {
      return
    }

    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: work.id,
            accessType: "PUBLIC",
          },
        },
      })

      toast.success(`作品 #${work.id} を公開に戻しました`)
      await props.onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "作品の再公開に失敗しました")
    }
  }

  const handleToggleCommentBan = async () => {
    if (!owner) {
      return
    }

    try {
      await toggleCommentBan({
        variables: {
          input: {
            targetUserId: owner.id,
            isBanned: !owner.isCommentBanned,
          },
        },
      })

      toast.success(
        `${owner.name} のコメントBANを${owner.isCommentBanned ? "解除" : "設定"}しました`,
      )
      await props.onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "コメントBANの更新に失敗しました")
    }
  }

  const handleTogglePostBan = async () => {
    if (!owner) {
      return
    }

    try {
      await togglePostBan({
        variables: {
          input: {
            targetUserId: owner.id,
            isBanned: !owner.isPostBanned,
          },
        },
      })

      toast.success(
        `${owner.name} の投稿BANを${owner.isPostBanned ? "解除" : "設定"}しました`,
      )
      await props.onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "投稿BANの更新に失敗しました")
    }
  }

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {work?.smallThumbnailImageURL ? (
            <div className="size-28 shrink-0 overflow-hidden rounded-2xl border border-white/10">
              <CroppedWorkSquare
                workId={work.id}
                subWorksCount={work.subWorksCount}
                imageUrl={work.smallThumbnailImageURL}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="md"
                imageWidth={work.smallThumbnailImageWidth ?? 1200}
                imageHeight={work.smallThumbnailImageHeight ?? 1200}
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="break-all text-base">
              {work?.title ?? "削除済みまたは取得不可の作品"}
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {work?.id ? <span>作品ID: {work.id}</span> : null}
              {owner ? <span>投稿者: {owner.name} @{owner.login}</span> : null}
              <span>通報件数: {props.group.items.length}</span>
              <span>最新通報: {toDateTimeText(props.group.items[0].createdAt, true)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(props.group.items.map((item) => item.reason))).map((reason) => (
                <Badge key={reason} variant="secondary" className="bg-white/10 text-slate-100">
                  {toReasonText(reason)}
                </Badge>
              ))}
              {work ? (
                <Badge variant={work.accessType === "PRIVATE" ? "destructive" : "secondary"} className={work.accessType === "PRIVATE" ? undefined : "bg-white/10 text-slate-100"}>
                  {work.accessType}
                </Badge>
              ) : null}
              {work ? (
                <Badge variant={work.adminAccessType === "PUBLIC" ? "secondary" : "destructive"} className={work.adminAccessType === "PUBLIC" ? "bg-white/10 text-slate-100" : undefined}>
                  {work.adminAccessType === "PUBLIC" ? "運営公開" : work.adminAccessType === "TEMPORARY_PRIVATE" ? "一時非公開" : "運営非公開"}
                </Badge>
              ) : null}
              {work?.isDeleted ? <Badge variant="destructive">削除済み</Badge> : null}
              <Badge
                variant={isReachableOnPublicPostPage ? "secondary" : "outline"}
                className={isReachableOnPublicPostPage ? "bg-emerald-500/15 text-emerald-100" : "border-amber-400/30 bg-amber-500/10 text-amber-100"}
              >
                {isReachableOnPublicPostPage ? "公開URLで表示可" : "公開URLでは404想定"}
              </Badge>
            </div>
            {work?.id ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary" className="bg-white/10 text-slate-100 hover:bg-white/20">
                  <Link to={`/posts/${work.id}`} target="_blank" rel="noreferrer noopener">
                    {isReachableOnPublicPostPage ? "作品ページ" : "作品ページ(404確認用)"}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                  <Link to={`/admin/works?workId=${work.id}`}>
                    作品管理へ
                  </Link>
                </Button>
                {owner ? (
                  <Button asChild size="sm" variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                    <Link to={`/admin/users?userId=${owner.id}`}>
                      ユーザ管理へ
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-rose-400/20 bg-[linear-gradient(180deg,rgba(76,29,57,0.92)_0%,rgba(59,24,52,0.92)_100%)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Lock className="size-4" />
              <p className="font-semibold text-base text-rose-50">作品対応</p>
            </div>
            {work ? (
              <div className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-sky-400/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"
                      disabled={isUpdatingWork || work.isDeleted}
                    >
                      <LockOpen className="mr-2 size-4" />
                      {work.isDeleted ? "削除済みのため再公開不可" : "作品を公開に戻す"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>作品を公開に戻す</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        作品「{work.title || "(無題)"}」を公開状態に戻します。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                        キャンセル
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRestoreWork}
                        className={[buttonVariants({ variant: "default" }), "bg-sky-500 text-slate-950 hover:bg-sky-400"].join(" ")}
                      >
                        公開に戻す
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="space-y-2">
                  <p className="text-sm text-rose-100/80">テンプレートを選んで理由文を確認してから非公開にします。</p>
                  <Select value={templateKey} onValueChange={(value) => setTemplateKey(value as ModerationMessageTemplateKey)}>
                    <SelectTrigger className="h-12 border-rose-300/20 bg-slate-950/40 text-slate-100">
                      <SelectValue placeholder="テンプレートを選択" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100">
                      {MODERATION_MESSAGE_TEMPLATES.map((template) => (
                        <SelectItem key={template.key} value={template.key}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={notifyMessage}
                  onChange={(event) => setNotifyMessage(event.target.value)}
                  rows={7}
                  placeholder="利用者に送る理由文"
                  className="min-h-[180px] border-rose-300/20 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-rose-600 text-white hover:bg-rose-500"
                      disabled={isUpdatingWork}
                    >
                      {isUpdatingWork ? "処理中..." : "テンプレ付きで作品を非公開"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>作品を非公開にする</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        作品「{work.title || "(無題)"}」を非公開にし、選択した理由文を保存します。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                        キャンセル
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleHideWork}
                        className={[buttonVariants({ variant: "destructive" }), "bg-rose-600 hover:bg-rose-500"].join(" ")}
                      >
                        非公開にする
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <p className="text-sm text-rose-100/70">作品情報が取得できないため、この画面からは非公開処理できません。</p>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareOff className="size-4" />
              <p className="font-semibold text-base">投稿者対応</p>
            </div>
            {owner ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">コメントBAN状態</p>
                    <Badge
                      variant={owner.isCommentBanned ? "destructive" : "secondary"}
                      className={owner.isCommentBanned ? "mt-2" : "mt-2 bg-white/10 text-slate-100"}
                    >
                      {owner.isCommentBanned ? "BAN中" : "正常"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">投稿BAN状態</p>
                    <Badge
                      variant={owner.isPostBanned ? "destructive" : "secondary"}
                      className={owner.isPostBanned ? "mt-2" : "mt-2 bg-white/10 text-slate-100"}
                    >
                      {owner.isPostBanned ? "BAN中" : "正常"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={owner.isCommentBanned ? "destructive" : "outline"}
                        className={owner.isCommentBanned ? "flex-1 bg-rose-600 text-white hover:bg-rose-500" : "flex-1 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}
                        disabled={isCommentBanLoading}
                      >
                        {isCommentBanLoading ? "処理中..." : `コメントBAN${owner.isCommentBanned ? "解除" : "設定"}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{owner.isCommentBanned ? "コメントBAN解除" : "コメントBAN設定"}</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          ユーザー「{owner.name}」(@{owner.login}) のコメントBANを{owner.isCommentBanned ? "解除" : "設定"}します。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleToggleCommentBan}
                          className={[
                            buttonVariants({ variant: owner.isCommentBanned ? "default" : "destructive" }),
                            owner.isCommentBanned ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "bg-rose-600 hover:bg-rose-500",
                          ].join(" ")}
                        >
                          {owner.isCommentBanned ? "BAN解除" : "BAN設定"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={owner.isPostBanned ? "destructive" : "outline"}
                        className={owner.isPostBanned ? "flex-1 bg-rose-600 text-white hover:bg-rose-500" : "flex-1 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}
                        disabled={isPostBanLoading}
                      >
                        {isPostBanLoading ? "処理中..." : `投稿BAN${owner.isPostBanned ? "解除" : "設定"}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-white/10 bg-slate-950/95 text-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{owner.isPostBanned ? "投稿BAN解除" : "投稿BAN設定"}</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          ユーザー「{owner.name}」(@{owner.login}) の投稿BANを{owner.isPostBanned ? "解除" : "設定"}します。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleTogglePostBan}
                          className={[
                            buttonVariants({ variant: owner.isPostBanned ? "default" : "destructive" }),
                            owner.isPostBanned ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "bg-rose-600 hover:bg-rose-500",
                          ].join(" ")}
                        >
                          {owner.isPostBanned ? "BAN解除" : "BAN設定"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">投稿者情報が取得できないため、BAN状態の確認と更新はできません。</p>
            )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-3">
          {props.group.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Badge variant="outline" className="border-white/20 bg-slate-950/50 text-slate-100">
                  #{item.id}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-slate-100">
                  {toReasonText(item.reason)}
                </Badge>
                <span>{toReportStatusText(item.reportStatus)}</span>
                <span>{toDateTimeText(item.createdAt, true)}</span>
                <span>
                  通報者: {item.reportUser ? `${item.reportUser.name} @${item.reportUser.login}` : "不明"}
                </span>
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-200">
                {item.comment && item.comment.trim().length > 0 ? item.comment : "詳細コメントなし"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const viewerQuery = gql`
  query AdminReportsViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminWorkReportsQuery = gql`
  query AdminWorkReports($offset: Int!, $limit: Int!, $onlyUnhandled: Boolean) {
    adminWorkReports(offset: $offset, limit: $limit, onlyUnhandled: $onlyUnhandled) {
      id
      createdAt
      comment
      reason
      reportStatus
      reportUser {
        id
        name
        login
      }
      work {
        id
        title
        accessType
        adminAccessType
        isDeleted
        smallThumbnailImageURL
        subWorksCount
        thumbnailImagePosition
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        user {
          id
          name
          login
          isCommentBanned
          isPostBanned
        }
      }
    }
  }
`

const changeWorkSettingsWithAdminMutation = gql`
  mutation AdminReportsChangeWorkSettingsWithAdmin($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }
`

const toggleUserCommentBanMutation = gql`
  mutation AdminReportsToggleUserCommentBan($input: ToggleUserCommentBanInput!) {
    toggleUserCommentBan(input: $input)
  }
`

const toggleUserPostBanMutation = gql`
  mutation AdminReportsToggleUserPostBan($input: ToggleUserPostBanInput!) {
    toggleUserPostBan(input: $input)
  }
`