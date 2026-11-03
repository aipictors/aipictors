import { useLazyQuery, useMutation, useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { LikeButton } from "~/components/like-button"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useToast } from "~/hooks/use-toast"
import { Link } from "~/lib/app/locale-router"
import { AdminWorkExpandedDetails } from "~/routes/($lang)._main.admin.works/components/admin-work-expanded-details"
import { AdminWorkPrivatePanel } from "~/routes/($lang)._main.admin.works/components/admin-work-private-panel"
import {
  adminWorkCommentsQuery,
  adminWorkDetailQuery,
  changeWorkAccessTypeMutation,
  createModeratorMessageMutation,
} from "~/routes/($lang)._main.admin.works/components/admin-works-queries"
import {
  NOTIFY_TEMPLATES,
  type TemplateKey,
} from "~/routes/($lang)._main.admin.works/utils/admin-work-notify-templates"
import {
  toAccessTypeText,
  toAdminAccessTypeText,
  toWorkTypeText,
  type WorkItem,
} from "~/routes/($lang)._main.admin.works/utils/admin-works-utils"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import type { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { toDateTimeText } from "~/utils/to-date-time-text"

type WorkModerationCardProps = {
  work: WorkItem
  onDone: () => Promise<void>
}

export function WorkModerationCard(props: WorkModerationCardProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [templateKey, setTemplateKey] = useState<TemplateKey>("EMPTY")
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

  const selectedTemplate = useMemo(
    () => NOTIFY_TEMPLATES.find((item) => item.key === templateKey),
    [templateKey],
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
    if (
      !(detail.type === "NOVEL" || detail.type === "COLUMN") ||
      !detail.mdUrl
    ) {
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

  const resolvedReason = selectedTemplate?.text ?? ""

  const defaultNotice = resolvedReason
    ? `作品を非公開にしました。理由: ${resolvedReason}`
    : "作品を非公開にしました。"

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }
    setNotifyMessage(selectedTemplate.text)
  }, [selectedTemplate])

  const onChangeAccessType = async (target: "PRIVATE" | "PUBLIC") => {
    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: props.work.id,
            accessType: target,
            moderationMessage:
              target === "PRIVATE"
                ? notifyMessage.trim().length > 0
                  ? notifyMessage.trim()
                  : defaultNotice
                : undefined,
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
    props.work.imageURL,
    ...props.work.subWorks.map((item) => item.imageUrl),
  ].filter(Boolean) as string[]
  const comments = (commentsData?.work?.comments ?? []) as FragmentOf<
    typeof CommentListItemFragment
  >[]
  const isReachableOnPublicPostPage =
    !props.work.isDeleted &&
    props.work.adminAccessType === "PUBLIC" &&
    props.work.accessType !== "PRIVATE" &&
    props.work.accessType !== "DRAFT"

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="break-all text-base">
              {props.work.title || "(無題)"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge
                variant="outline"
                className="border-white/20 bg-slate-950/50 text-slate-100"
              >
                #{props.work.id}
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-slate-100">
                {toWorkTypeText(props.work.type)}
              </Badge>
              <Badge
                variant={
                  props.work.accessType === "PRIVATE"
                    ? "destructive"
                    : "default"
                }
              >
                {toAccessTypeText(props.work.accessType)}
              </Badge>
              <Badge
                variant={
                  props.work.adminAccessType === "PUBLIC"
                    ? "secondary"
                    : "destructive"
                }
                className={
                  props.work.adminAccessType === "PUBLIC"
                    ? "bg-white/10 text-slate-100"
                    : undefined
                }
              >
                {toAdminAccessTypeText(props.work.adminAccessType)}
              </Badge>
              {props.work.isDeleted && (
                <Badge variant="destructive">削除済み</Badge>
              )}
              <Badge
                variant={isReachableOnPublicPostPage ? "secondary" : "outline"}
                className={
                  isReachableOnPublicPostPage
                    ? "bg-emerald-500/15 text-emerald-100"
                    : "border-amber-400/30 bg-amber-500/10 text-amber-100"
                }
              >
                {isReachableOnPublicPostPage
                  ? "公開URLで表示可"
                  : "公開URLでは404想定"}
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

      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(320px,560px)_minmax(420px,1fr)]">
          {props.work.type === "WORK" &&
          (props.work.imageURL || props.work.subWorks.length > 0) ? (
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <WorkImageView
                workImageURL={props.work.imageURL ?? undefined}
                subWorkImageURLs={
                  props.work.subWorks
                    .map((subWork) => subWork.imageUrl)
                    .filter(Boolean) as string[]
                }
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

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/25 p-4">
              <p className="line-clamp-3 text-sm leading-7 text-slate-200">
                {props.work.description || "説明文なし"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>複数画像: {props.work.subWorksCount}</span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3" /> {props.work.likesCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3" />{" "}
                  {props.work.commentsCount}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="h-12 rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 text-base text-cyan-100 hover:bg-cyan-500/25"
              >
                <Link
                  to={`/posts/${props.work.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {isReachableOnPublicPostPage
                    ? "作品ページ"
                    : "作品ページ(404確認用)"}
                </Link>
              </Button>

              {props.work.user && (
                <div className="[&_button]:!rounded-2xl [&_button]:!border [&_button]:!border-white/10 [&_button]:!bg-white/5 [&_button]:!px-4 [&_button]:!text-slate-100 [&_button:hover]:!bg-white/10 [&_button>span]:!text-slate-100">
                  <LikeButton
                    size={48}
                    text={`いいね ${props.work.likesCount}`}
                    defaultLiked={props.work.isLiked}
                    defaultLikedCount={props.work.likesCount}
                    isSensitive={props.work.isSensitive}
                    targetWorkId={props.work.id}
                    targetWorkOwnerUserId={props.work.user.id}
                    isTargetUserBlocked={props.work.user.isBlocked}
                  />
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="h-12 rounded-2xl border-emerald-400/30 bg-emerald-500/15 px-5 text-base text-emerald-100 hover:bg-emerald-500/25"
                onClick={() => setExpanded((prev) => !prev)}
              >
                <MessageSquare className="mr-1 size-4" />
                コメント {props.work.commentsCount}
              </Button>

              <ReportDialog
                postId={props.work.id}
                buttonClassName="flex h-12 items-center gap-2 rounded-2xl border-amber-400/30 bg-amber-500/15 px-5 text-base text-amber-100 hover:bg-amber-500/25"
              />
            </div>

            <AdminWorkPrivatePanel
              defaultNotice={defaultNotice}
              isSendingMessage={isSendingMessage}
              isUpdating={isUpdating}
              notifyMessage={notifyMessage}
              onChangeAccessType={onChangeAccessType}
              setNotifyMessage={setNotifyMessage}
              setTemplateKey={setTemplateKey}
              templateKey={templateKey}
            />
          </div>
        </div>

        {expanded && (
          <AdminWorkExpandedDetails
            comments={comments}
            commentsLoading={commentsLoading}
            defaultNotice={defaultNotice}
            detail={detail}
            detailLoading={detailLoading}
            isMarkdownLoading={isMarkdownLoading}
            markdown={markdown}
            mediaImages={mediaImages}
            notifyMessage={notifyMessage}
            setNotifyMessage={setNotifyMessage}
            setShouldNotify={setShouldNotify}
            shouldNotify={shouldNotify}
            work={props.work}
          />
        )}
      </CardContent>
    </Card>
  )
}
