import { useLazyQuery, useMutation, useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link, useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect, useMemo, useState } from "react"
import {
  BookText,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Lock,
  LockOpen,
  MessageSquare,
  ThumbsUp,
  Video,
} from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"
import { useToast } from "~/hooks/use-toast"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import {
  CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "作品管理",
      enTitle: "Work Moderation",
      description: "モデレーター向け作品管理ページ",
      enDescription: "Moderator work moderation page",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const PAGE_SIZE = 12

const REASON_TEMPLATES = [
  {
    key: "GUIDELINE",
    label: "ガイドライン違反の疑い",
    text: "コミュニティガイドラインに抵触する可能性があるため、確認のため一時的に非公開にしました。",
  },
  {
    key: "MISLEADING",
    label: "誤解を招く内容",
    text: "内容に誤解を招く表現が含まれている可能性があるため、確認のため一時的に非公開にしました。",
  },
  {
    key: "RIGHTS",
    label: "権利関連の確認",
    text: "権利関連の確認が必要なため、審査完了まで一時的に非公開にしました。",
  },
  {
    key: "CUSTOM",
    label: "カスタム",
    text: "",
  },
] as const

type ReasonKey = (typeof REASON_TEMPLATES)[number]["key"]

type WorkItem = {
  id: string
  title: string
  description: string | null
  type: "WORK" | "VIDEO" | "NOVEL" | "COLUMN" | string
  accessType: string
  createdAt: number
  likesCount: number
  commentsCount: number
  subWorksCount: number
  imageURL: string | null
  isCommentsEditable: boolean
  isLiked: boolean
  isSensitive: boolean
  smallThumbnailImageURL: string | null
  subWorks: Array<{
    id: string
    imageUrl: string | null
  }>
  user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
    isBlocked: boolean
  } | null
}

const toAccessTypeText = (accessType: string) => {
  switch (accessType) {
    case "PUBLIC":
      return "公開"
    case "PRIVATE":
      return "非公開"
    case "DRAFT":
      return "下書き"
    case "LIMITED":
      return "限定公開"
    case "SILENT":
      return "サイレント"
    default:
      return accessType
  }
}

const toWorkTypeText = (type: WorkItem["type"]) => {
  switch (type) {
    case "WORK":
      return "イラスト"
    case "VIDEO":
      return "動画"
    case "NOVEL":
      return "小説"
    case "COLUMN":
      return "コラム"
    default:
      return type
  }
}

export default function AdminWorksPage() {
  const { toast } = useToast()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0", 10) || 0,
    0,
  )

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const { data: worksData, loading: worksLoading, refetch } = useQuery(
    adminWorksQuery,
    {
      variables: {
        offset: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
      skip:
        authContext.isLoading ||
        authContext.isNotLoggedIn ||
        !viewerData?.viewer?.isModerator,
      fetchPolicy: "cache-and-network",
    },
  )

  const works = (worksData?.works ?? []) as WorkItem[]
  const worksCount = worksData?.worksCount ?? 0
  const maxPage = Math.max(Math.ceil(worksCount / PAGE_SIZE) - 1, 0)

  const pageDescription = "作品の確認、非公開化、投稿者通知を行います。"

  const onMovePage = (nextPage: number) => {
    const targetPage = Math.max(0, Math.min(nextPage, maxPage))
    const next = new URLSearchParams(searchParams)
    next.set("page", String(targetPage))
    setSearchParams(next)
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
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
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
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
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
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
      title="作品管理"
      description={pageDescription}
      icon={ImageIcon}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          全 {worksCount} 件 / {page + 1} ページ目
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            disabled={page <= 0}
            onClick={() => onMovePage(page - 1)}
          >
            前へ
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            disabled={page >= maxPage}
            onClick={() => onMovePage(page + 1)}
          >
            次へ
          </Button>
        </div>
      </div>

      {worksLoading ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            読み込み中...
          </CardContent>
        </Card>
      ) : works.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            対象の作品はありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <WorkModerationCard
              key={work.id}
              work={work}
              onDone={async () => {
                await refetch()
                toast({
                  title: "更新しました",
                  description: `作品 #${work.id} の状態を更新しました。`,
                })
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          disabled={page <= 0}
          onClick={() => onMovePage(page - 1)}
        >
          前へ
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          disabled={page >= maxPage}
          onClick={() => onMovePage(page + 1)}
        >
          次へ
        </Button>
      </div>
    </AdminPageShell>
  )
}

type WorkModerationCardProps = {
  work: WorkItem
  onDone: () => Promise<void>
}

function WorkModerationCard(props: WorkModerationCardProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [reasonKey, setReasonKey] = useState<ReasonKey>("GUIDELINE")
  const [customReason, setCustomReason] = useState("")
  const [notifyMessage, setNotifyMessage] = useState("")
  const [shouldNotify, setShouldNotify] = useState(true)
  const [markdown, setMarkdown] = useState("")
  const [isMarkdownLoading, setIsMarkdownLoading] = useState(false)

  const [loadWorkDetail, { data: detailData, loading: detailLoading }] =
    useLazyQuery(adminWorkDetailQuery, {
      fetchPolicy: "cache-first",
    })

  const [changeWorkSettingsWithAdmin, { loading: isUpdating }] = useMutation(
    changeWorkAccessTypeMutation,
  )
  const [createMessage, { loading: isSendingMessage }] = useMutation(
    createModeratorMessageMutation,
  )
  const { data: commentsData, loading: commentsLoading } = useQuery(
    adminWorkCommentsQuery,
    {
      skip: !expanded || !props.work.isCommentsEditable,
      fetchPolicy: "network-only",
      variables: {
        workId: props.work.id,
      },
    },
  )

  const selectedReason = useMemo(
    () => REASON_TEMPLATES.find((item) => item.key === reasonKey),
    [reasonKey],
  )

  useEffect(() => {
    if (!expanded) {
      return
    }
    if (props.work.type === "WORK") {
      return
    }
    if (detailData?.work || detailLoading) {
      return
    }

    loadWorkDetail({
      variables: {
        id: props.work.id,
      },
    })
  }, [expanded, detailData, detailLoading, loadWorkDetail, props.work.id])

  useEffect(() => {
    const detail = detailData?.work
    if (!expanded || !detail) {
      return
    }
    if (!(detail.type === "NOVEL" || detail.type === "COLUMN") || !detail.mdUrl) {
      return
    }

    let cancelled = false
    setIsMarkdownLoading(true)

    fetch(detail.mdUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) {
          setMarkdown(text)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkdown("")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsMarkdownLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [detailData, expanded])

  const resolvedReason =
    reasonKey === "CUSTOM"
      ? customReason.trim()
      : (selectedReason?.text ?? "")

  const defaultNotice = resolvedReason
    ? `作品を非公開にしました。理由: ${resolvedReason}`
    : "作品を非公開にしました。"

  const onChangeAccessType = async (target: "PRIVATE" | "PUBLIC") => {
    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: props.work.id,
            accessType: target,
          },
        },
      })

      const ownerId = props.work.user?.id
      if (target === "PRIVATE" && shouldNotify && ownerId) {
        await createMessage({
          variables: {
            input: {
              targetUserId: ownerId,
              text:
                notifyMessage.trim().length > 0
                  ? notifyMessage.trim()
                  : defaultNotice,
            },
          },
        })
      }

      await props.onDone()
    } catch (error) {
      toast({
        title: "更新に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラー",
      })
    }
  }

  const detail = detailData?.work
  const mediaImages = [props.work.imageURL, ...props.work.subWorks.map((item) => item.imageUrl)]
    .filter(Boolean) as string[]
  const comments =
    (commentsData?.work?.comments ?? []) as FragmentOf<typeof CommentListItemFragment>[]

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="break-all text-base">
              {props.work.title || "(無題)"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge variant="outline" className="border-white/20 bg-slate-950/50 text-slate-100">
                #{props.work.id}
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-slate-100">
                {toWorkTypeText(props.work.type)}
              </Badge>
              <Badge variant={props.work.accessType === "PRIVATE" ? "destructive" : "default"}>
                {toAccessTypeText(props.work.accessType)}
              </Badge>
              <span>投稿者: {props.work.user?.name ?? "-"}</span>
              <span>@{props.work.user?.login ?? "-"}</span>
              <span>{toDateTimeText(props.work.createdAt, true)}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 size-4" /> 折りたたむ
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 size-4" /> 展開
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[320px_1fr]">
          {props.work.type === "WORK" && (props.work.imageURL || props.work.subWorks.length > 0) ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
              <WorkImageView
                workImageURL={props.work.imageURL ?? undefined}
                subWorkImageURLs={props.work.subWorks
                  .map((subWork) => subWork.imageUrl)
                  .filter(Boolean) as string[]}
                mode="dialog"
              />
            </div>
          ) : props.work.smallThumbnailImageURL ? (
            <img
              src={props.work.smallThumbnailImageURL}
              alt={props.work.title}
              loading="lazy"
              className="h-32 w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              サムネイルなし
            </div>
          )}

          <div className="space-y-2">
            <p className="line-clamp-3 text-sm text-slate-300">
              {props.work.description || "説明文なし"}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>複数画像: {props.work.subWorksCount}</span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="size-3" /> {props.work.likesCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3" /> {props.work.commentsCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="bg-white/10 text-slate-100 hover:bg-white/20"
              >
                <Link to={`/posts/${props.work.id}`} target="_blank" rel="noreferrer noopener">
                  作品ページ
                </Link>
              </Button>

              {props.work.user && (
                <LikeButton
                  size={36}
                  text={`いいね ${props.work.likesCount}`}
                  defaultLiked={props.work.isLiked}
                  defaultLikedCount={props.work.likesCount}
                  isSensitive={props.work.isSensitive}
                  targetWorkId={props.work.id}
                  targetWorkOwnerUserId={props.work.user.id}
                  isTargetUserBlocked={props.work.user.isBlocked}
                />
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                onClick={() => setExpanded((prev) => !prev)}
              >
                <MessageSquare className="mr-1 size-4" />
                コメント {props.work.commentsCount}
              </Button>

              <ReportDialog postId={props.work.id} />
            </div>
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <p className="font-medium text-sm">作品詳細</p>
              {detailLoading && (
                <p className="text-slate-400 text-sm">詳細を読み込み中...</p>
              )}

              {props.work.type === "WORK" && mediaImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {mediaImages.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`work-${index}`}
                      loading="lazy"
                      className="h-28 w-full rounded-2xl border border-white/10 object-cover"
                    />
                  ))}
                </div>
              )}

              {!detailLoading && detail?.type === "VIDEO" && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm">
                    <Video className="size-4" /> 動画
                  </div>
                  {detail.url ? (
                    <video
                      controls
                      preload="none"
                      src={detail.url}
                      className="max-h-80 w-full rounded-2xl border border-white/10 bg-black"
                    />
                  ) : (
                    <p className="text-slate-400 text-sm">動画URLがありません。</p>
                  )}
                </div>
              )}

              {!detailLoading && (detail?.type === "NOVEL" || detail?.type === "COLUMN") && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm">
                    <BookText className="size-4" />
                    {detail.type === "NOVEL" ? "小説" : "テキスト"}
                  </div>
                  {isMarkdownLoading ? (
                    <p className="text-slate-400 text-sm">本文を読み込み中...</p>
                  ) : markdown.length > 0 ? (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-200">
                      {markdown.slice(0, 2000)}
                    </pre>
                  ) : (
                    <p className="text-slate-400 text-sm">本文を取得できませんでした。</p>
                  )}
                </div>
              )}

              {!detailLoading && !detail && (
                props.work.type !== "WORK" ? (
                  <p className="text-slate-400 text-sm">詳細データが取得できませんでした。</p>
                ) : null
              )}
            </div>

            <Separator className="bg-white/10" />

            {props.work.isCommentsEditable ? (
              <div className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                <p className="font-medium text-sm">コメント</p>
                <WorkCommentList
                  workId={props.work.id}
                  comments={comments}
                  isLoadingComments={commentsLoading}
                  workOwnerIconImageURL={props.work.user?.iconUrl ?? undefined}
                  isWorkOwnerBlocked={props.work.user?.isBlocked ?? false}
                  defaultShowCommentCount={6}
                />
              </div>
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                この作品はコメント不可です。
              </div>
            )}

            <Separator className="bg-white/10" />

            <div className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
              <p className="font-medium text-sm">非公開処理と通知</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>非公開理由テンプレート</Label>
                  <Select
                    value={reasonKey}
                    onValueChange={(value) => setReasonKey(value as ReasonKey)}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue placeholder="理由を選択" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100 backdrop-blur">
                      {REASON_TEMPLATES.map((reason) => (
                        <SelectItem
                          key={reason.key}
                          value={reason.key}
                          className="text-slate-100 focus:bg-white/10 focus:text-white"
                        >
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>カスタム理由（任意）</Label>
                  <Input
                    value={customReason}
                    onChange={(event) => setCustomReason(event.target.value)}
                    placeholder="必要なら具体的な理由を入力"
                    disabled={reasonKey !== "CUSTOM"}
                    className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`notify-owner-${props.work.id}`}
                  checked={shouldNotify}
                  onCheckedChange={(checked) => setShouldNotify(Boolean(checked))}
                />
                <Label htmlFor={`notify-owner-${props.work.id}`}>
                  投稿者へ通知する
                </Label>
              </div>

              <div className="space-y-2">
                <Label>通知メッセージ（空ならテンプレートを自動使用）</Label>
                <Textarea
                  value={notifyMessage}
                  onChange={(event) => setNotifyMessage(event.target.value)}
                  placeholder={defaultNotice}
                  rows={3}
                  className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-rose-600 text-white hover:bg-rose-500"
                  disabled={isUpdating || isSendingMessage}
                  onClick={() => onChangeAccessType("PRIVATE")}
                >
                  <Lock className="mr-1 size-4" />
                  非公開にする
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  disabled={isUpdating || isSendingMessage}
                  onClick={() => onChangeAccessType("PUBLIC")}
                >
                  <LockOpen className="mr-1 size-4" />
                  公開に戻す
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

const viewerQuery = gql`
  query AdminWorksViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminWorksQuery = gql`
  query AdminWorks($offset: Int!, $limit: Int!) {
    works(offset: $offset, limit: $limit, where: {}) {
      id
      title
      description
      type
      accessType
      createdAt
      likesCount
      commentsCount
      subWorksCount
      imageURL
      isCommentsEditable
      isLiked
      isSensitive
      smallThumbnailImageURL
      subWorks {
        id
        imageUrl
      }
      user {
        id
        name
        login
        iconUrl
        isBlocked
      }
    }
    worksCount(where: {})
  }
`

const adminWorkDetailQuery = gql`
  query AdminWorkDetail($id: ID!) {
    work(id: $id) {
      id
      type
      url
      mdUrl
      imageURL
      subWorks {
        id
        imageUrl
      }
    }
  }
`

const adminWorkCommentsQuery = graphql(
  `query AdminWorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
  }`,
  [CommentListItemFragment],
)

const changeWorkAccessTypeMutation = gql`
  mutation AdminChangeWorkAccessType($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }
`

const createModeratorMessageMutation = gql`
  mutation AdminCreateModeratorMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`
