import type { FragmentOf } from "gql.tada"
import { BookText, Video } from "lucide-react"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import type { WorkItem } from "~/routes/($lang)._main.admin.works/utils/admin-works-utils"
import {
  type CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"

/** AdminWorkDetail の結果 */
export type AdminWorkDetail = {
  type: string
  url?: string | null
  mdUrl?: string | null
}

/**
 * 作品を展開したときの詳細、コメント、通知の設定
 */
export function AdminWorkExpandedDetails(props: {
  comments: FragmentOf<typeof CommentListItemFragment>[]
  commentsLoading: boolean
  defaultNotice: string
  detail?: AdminWorkDetail | null
  detailLoading: boolean
  isMarkdownLoading: boolean
  markdown: string
  mediaImages: string[]
  notifyMessage: string
  setNotifyMessage: (value: string) => void
  setShouldNotify: (value: boolean) => void
  shouldNotify: boolean
  work: WorkItem
}) {
  const {
    comments,
    commentsLoading,
    defaultNotice,
    detail,
    detailLoading,
    isMarkdownLoading,
    markdown,
    mediaImages,
    notifyMessage,
    setNotifyMessage,
    setShouldNotify,
    shouldNotify,
  } = props

  return (
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

        {!detailLoading &&
          (detail?.type === "NOVEL" || detail?.type === "COLUMN") && (
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
                <p className="text-slate-400 text-sm">
                  本文を取得できませんでした。
                </p>
              )}
            </div>
          )}

        {!detailLoading &&
          !detail &&
          (props.work.type !== "WORK" ? (
            <p className="text-slate-400 text-sm">
              詳細データが取得できませんでした。
            </p>
          ) : null)}
      </div>

      <Separator className="bg-white/10" />

      {props.work.isCommentsEditable ? (
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/35 p-4 [&_button]:border-white/10 [&_button]:!bg-white/5 [&_button]:!text-slate-100 [&_button:hover]:!bg-white/10 [&_button:hover]:!text-white [&_button>span]:!text-slate-100 [&_.text-muted-foreground]:!text-slate-400 [&_.text-foreground]:!text-slate-100">
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
        <p className="font-medium text-sm">通知の詳細設定</p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>通知メッセージ（空ならテンプレートを自動使用）</Label>
            <Textarea
              value={notifyMessage}
              onChange={(event) => setNotifyMessage(event.target.value)}
              placeholder={defaultNotice}
              rows={5}
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
            追加でダイレクトメッセージも送る
          </Label>
        </div>
      </div>
    </>
  )
}
