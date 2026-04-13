import { useLazyQuery, useMutation, useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link, useSearchParams } from "@remix-run/react"
import { useContext, useEffect, useMemo, useState } from "react"
import {
  BookText,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Lock,
  LockOpen,
  MessageSquare,
  Shield,
  ThumbsUp,
  Video,
} from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
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
import { AuthContext } from "~/contexts/auth-context"
import { useToast } from "~/hooks/use-toast"
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
  smallThumbnailImageURL: string | null
  user: {
    id: string
    name: string
    login: string
  } | null
}

export default function AdminWorksPage() {
  const { toast } = useToast()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0", 10) || 0,
    0,
  )

  const [showLikeOption, setShowLikeOption] = useState(false)
  const [showCommentOption, setShowCommentOption] = useState(false)
  const [showStampOption, setShowStampOption] = useState(false)

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

  const onMovePage = (nextPage: number) => {
    const targetPage = Math.max(0, Math.min(nextPage, maxPage))
    const next = new URLSearchParams(searchParams)
    next.set("page", String(targetPage))
    setSearchParams(next)
  }

  if (authContext.isLoading || viewerLoading) {
    return <div className="container mx-auto max-w-6xl py-8" />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスするにはログインが必要です。</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!viewerData?.viewer?.isModerator) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Alert>
          <AlertDescription>このページにアクセスする権限がありません。</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-4 py-8">
      <div className="flex items-center gap-2">
        <Shield className="size-6 text-cyan-500" />
        <h1 className="font-bold text-2xl">作品管理</h1>
        <Badge variant="secondary">noindex</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/admin">管理トップ</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/comments">コメント審査</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/users">ユーザ管理</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">オプション（軽量運用）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-like-option"
                checked={showLikeOption}
                onCheckedChange={(checked) => setShowLikeOption(Boolean(checked))}
              />
              <Label htmlFor="show-like-option">いいね操作リンクを表示</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-comment-option"
                checked={showCommentOption}
                onCheckedChange={(checked) =>
                  setShowCommentOption(Boolean(checked))
                }
              />
              <Label htmlFor="show-comment-option">コメント導線を表示</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-stamp-option"
                checked={showStampOption}
                onCheckedChange={(checked) => setShowStampOption(Boolean(checked))}
              />
              <Label htmlFor="show-stamp-option">スタンプ導線を表示</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          全 {worksCount} 件 / {page + 1} ページ目
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 0}
            onClick={() => onMovePage(page - 1)}
          >
            前へ
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= maxPage}
            onClick={() => onMovePage(page + 1)}
          >
            次へ
          </Button>
        </div>
      </div>

      {worksLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            読み込み中...
          </CardContent>
        </Card>
      ) : works.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            対象の作品はありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <WorkModerationCard
              key={work.id}
              work={work}
              showLikeOption={showLikeOption}
              showCommentOption={showCommentOption}
              showStampOption={showStampOption}
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
          disabled={page <= 0}
          onClick={() => onMovePage(page - 1)}
        >
          前へ
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= maxPage}
          onClick={() => onMovePage(page + 1)}
        >
          次へ
        </Button>
      </div>
    </div>
  )
}

type WorkModerationCardProps = {
  work: WorkItem
  showLikeOption: boolean
  showCommentOption: boolean
  showStampOption: boolean
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

  const selectedReason = useMemo(
    () => REASON_TEMPLATES.find((item) => item.key === reasonKey),
    [reasonKey],
  )

  useEffect(() => {
    if (!expanded) {
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
  const mediaImages = [
    detail?.imageURL ?? null,
    ...(detail?.subWorks?.map((item: any) => item.imageUrl) ?? []),
  ].filter(Boolean) as string[]

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="break-all text-base">
              {props.work.title || "(無題)"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">#{props.work.id}</Badge>
              <Badge variant="secondary">{props.work.type}</Badge>
              <Badge variant={props.work.accessType === "PRIVATE" ? "destructive" : "default"}>
                {props.work.accessType}
              </Badge>
              <span>投稿者: {props.work.user?.name ?? "-"}</span>
              <span>@{props.work.user?.login ?? "-"}</span>
              <span>{toDateTimeText(props.work.createdAt, true)}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
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
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          {props.work.smallThumbnailImageURL ? (
            <img
              src={props.work.smallThumbnailImageURL}
              alt={props.work.title}
              loading="lazy"
              className="h-32 w-full rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md border text-muted-foreground text-xs">
              サムネイルなし
            </div>
          )}

          <div className="space-y-2">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {props.work.description || "説明文なし"}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>複数画像: {props.work.subWorksCount}</span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="size-3" /> {props.work.likesCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3" /> {props.work.commentsCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link to={`/posts/${props.work.id}`} target="_blank" rel="noreferrer noopener">
                  作品ページ
                </Link>
              </Button>

              {props.showLikeOption && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/posts/${props.work.id}`} target="_blank" rel="noreferrer noopener">
                    いいね対応
                  </Link>
                </Button>
              )}

              {props.showCommentOption && (
                <Button asChild size="sm" variant="outline">
                  <Link
                    to={`/posts/${props.work.id}#comments`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    コメント対応
                  </Link>
                </Button>
              )}

              {props.showStampOption && (
                <Button asChild size="sm" variant="outline">
                  <Link
                    to={`/posts/${props.work.id}#comments`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    スタンプ対応
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <>
            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-sm">展開プレビュー（遅延読み込み）</p>
              {detailLoading && (
                <p className="text-muted-foreground text-sm">詳細を読み込み中...</p>
              )}

              {!detailLoading && detail?.type === "WORK" && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {mediaImages.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`work-${index}`}
                      loading="lazy"
                      className="h-28 w-full rounded border object-cover"
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
                      className="max-h-80 w-full rounded border bg-black"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">動画URLがありません。</p>
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
                    <p className="text-muted-foreground text-sm">本文を読み込み中...</p>
                  ) : markdown.length > 0 ? (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded border bg-muted p-3 text-xs">
                      {markdown.slice(0, 2000)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">本文を取得できませんでした。</p>
                  )}
                </div>
              )}

              {!detailLoading && !detail && (
                <p className="text-muted-foreground text-sm">詳細データが取得できませんでした。</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3 rounded-md border p-3">
              <p className="font-medium text-sm">非公開処理と通知</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>非公開理由テンプレート</Label>
                  <Select
                    value={reasonKey}
                    onValueChange={(value) => setReasonKey(value as ReasonKey)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="理由を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_TEMPLATES.map((reason) => (
                        <SelectItem key={reason.key} value={reason.key}>
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
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isUpdating || isSendingMessage}
                  onClick={() => onChangeAccessType("PRIVATE")}
                >
                  <Lock className="mr-1 size-4" />
                  非公開にする
                </Button>
                <Button
                  size="sm"
                  variant="outline"
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
      smallThumbnailImageURL
      user {
        id
        name
        login
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
