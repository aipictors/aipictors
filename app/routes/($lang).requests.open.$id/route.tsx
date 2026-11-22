import type { MetaFunction } from "@remix-run/cloudflare"
import { useParams, useSearchParams } from "@remix-run/react"
import {
  ChevronLeft,
  Clock,
  Flag,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Trophy,
  Undo2,
} from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AutoTranslatedInline } from "~/components/auto-translated-text"
import { OpenRequestStatusBadge } from "~/components/requests/open-request-ui"
import { RequestImagePicker } from "~/components/requests/request-image-picker"
import {
  readAgeConfirmed,
  writeAgeConfirmed,
} from "~/components/requests/request-showcase"
import {
  CoinPrice,
  RequestImageGrid,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  isOpenRequestAwarded,
  type OpenRequest,
  type OpenRequestProposal,
  openRequestErrorMessage,
  openRequestsGet,
  openRequestsPost,
  parseWorkId,
} from "~/lib/open-requests-api"
import { formatDateTime, formatRemaining } from "~/lib/requests-api"
import { cn } from "~/lib/utils"

export const meta: MetaFunction = () => [
  { title: "募集リクエスト | Aipictors" },
]

const PROPOSALS_PER_USER = 3

/**
 * 募集リクエストの詳細。募集 → 提案 → コメントの 3 段のツリー。
 * 依頼者は提案を 1 件採用でき、ほかの人は提案・いいね・コメントができる
 */
export default function OpenRequestPage() {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const params = useParams()
  const [searchParams] = useSearchParams()
  const id = params.id ?? ""
  const [request, setRequest] = useState<OpenRequest | null>(null)
  const [users, setUsers] = useState<RequestUsers>({})
  const [notFound, setNotFound] = useState(false)
  const [ageOk, setAgeOk] = useState(true)
  const [awardTarget, setAwardTarget] = useState<OpenRequestProposal | null>(
    null,
  )
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    try {
      const data = await openRequestsGet<{
        request: OpenRequest
        users: RequestUsers
      }>({ op: "detail", id })
      setRequest(data.request)
      setUsers(data.users)
    } catch {
      setNotFound(true)
    }
  }, [id])

  useEffect(() => {
    if (auth.isLoading) return
    void reload()
  }, [reload, auth.isLoading, auth.userId])

  useEffect(() => {
    if (request?.isR18) setAgeOk(readAgeConfirmed())
  }, [request?.isR18])

  // 通知の「提案」から来たときは提案のところまで送る
  const focus = searchParams.get("proposal")
  useEffect(() => {
    if (!focus || !request) return
    document
      .getElementById(`proposal-${focus}`)
      ?.scrollIntoView({ block: "center" })
  }, [focus, request?.id])

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="font-bold">
          {t(
            "この募集は見つかりませんでした",
            "This request could not be found",
          )}
        </p>
        <Button asChild variant="secondary" className="rounded-full">
          <Link to="/requests/open">{t("募集の一覧へ", "Open requests")}</Link>
        </Button>
      </div>
    )
  }
  if (!request) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (request.isR18 && !ageOk) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="font-bold text-lg">
          {t("R18 の募集です", "This is an R18 request")}
        </p>
        <p className="text-muted-foreground text-sm">
          {t("18歳以上ですか？", "Are you 18 or older?")}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/requests/open">{t("いいえ", "No")}</Link>
          </Button>
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              writeAgeConfirmed(true)
              setAgeOk(true)
            }}
          >
            {t("はい", "Yes")}
          </Button>
        </div>
      </div>
    )
  }

  const isOpen = request.status === "OPEN"
  const isRequester = request.isMine
  const proposals = request.proposals ?? []
  const myCount = request.myProposalCount ?? 0
  const canPropose =
    isOpen &&
    !isRequester &&
    request.deadlineAt > Date.now() / 1000 &&
    myCount < PROPOSALS_PER_USER

  const act = async (body: Record<string, unknown>, done?: string) => {
    if (!auth.isLoggedIn) {
      toast.error(t("ログインしてください", "Please log in"))
      return false
    }
    setBusy(true)
    try {
      await openRequestsPost(body)
      if (done) toast.success(done)
      await reload()
      return true
    } catch (error) {
      toast.error(openRequestErrorMessage(error, t.isEnglish))
      return false
    } finally {
      setBusy(false)
    }
  }

  const report = async (body: Record<string, unknown>) => {
    const reason = window.prompt(
      t("通報の理由を書いてください", "Why are you reporting this?"),
    )
    if (!reason?.trim()) return
    await act(
      { ...body, action: "report", reason },
      t("通報しました", "Reported"),
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 pt-4 pb-24 md:px-6">
      <Link
        to="/requests/open"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("募集の一覧に戻る", "Back to open requests")}
      </Link>

      {/* 1 段目: 募集 */}
      <article className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <OpenRequestStatusBadge status={request.status} />
          {request.isR18 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[10px] text-white">
              R18
            </span>
          )}
          {isOpen && (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="size-3.5" />
              {formatRemaining(request.deadlineAt, t.isEnglish)}（
              {formatDateTime(request.deadlineAt)}）
            </span>
          )}
        </div>
        <h1 className="font-bold text-xl leading-snug">
          <AutoTranslatedInline text={request.title} />
        </h1>
        <div className="flex items-center justify-between gap-3">
          <RequestUserChip user={users[request.requesterUserId]} size="md" />
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-muted-foreground">
              {t("報酬", "Reward")}
            </span>
            <CoinPrice coins={request.rewardCoins} className="text-lg" />
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          <AutoTranslatedInline text={request.body} />
        </p>
        <RequestImageGrid urls={request.referenceImageUrls} />

        {isRequester && isOpen && (
          <p className="rounded-xl bg-amber-500/10 p-3 text-xs">
            {proposals.length === 0
              ? t(
                  "提案が届くまでは募集を取り下げられます（報酬は全額戻ります）。",
                  "You can cancel this request until entries arrive (full refund).",
                )
              : t(
                  "気に入った提案の「採用する」を押してください。締切までに採用しないと、いいねが一番多い提案が自動で採用されます。",
                  'Press "Pick" on the entry you like. If you don\'t pick one by the deadline, the most-liked entry is picked automatically.',
                )}
          </p>
        )}
        {isRequester && request.settlement && (
          <p className="text-muted-foreground text-xs">
            {t(
              `手数料 ${request.settlement.feeCoins} コインを引いて、採用された人に届けました。`,
              `The reward was sent to the picked creator after a ${request.settlement.feeCoins}-coin fee.`,
            )}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {isRequester && isOpen && proposals.length === 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    t("募集を取り下げますか？", "Cancel this request?"),
                  )
                )
                  return
                void act(
                  { op: "action", id: request.id, action: "cancel" },
                  t(
                    "募集を取り下げました。報酬は全額戻りました",
                    "Canceled. The reward was refunded",
                  ),
                )
              }}
            >
              <Undo2 className="mr-1 size-4" />
              {t("募集を取り下げる", "Cancel request")}
            </Button>
          )}
          {isRequester && isOpenRequestAwarded(request.status) && (
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={request.showcaseAllowed}
                disabled={busy}
                onCheckedChange={(v) =>
                  void act({
                    op: "action",
                    id: request.id,
                    action: "showcase",
                    allowed: v,
                  })
                }
              />
              {t(
                "採用した作品を実績として公開してOK",
                "Allow showing the picked work as an achievement",
              )}
            </label>
          )}
          {!isRequester && auth.isLoggedIn && (
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
              onClick={() => void report({ op: "action", id: request.id })}
            >
              <Flag className="size-3.5" />
              {t("通報", "Report")}
            </button>
          )}
        </div>
      </article>

      {canPropose && auth.isLoggedIn && (
        <ProposalForm
          requestId={request.id}
          remaining={PROPOSALS_PER_USER - myCount}
          onDone={reload}
        />
      )}
      {canPropose && auth.isNotLoggedIn && (
        <Button asChild className="rounded-full font-bold">
          <Link to="/login">
            {t("ログインして提案する", "Log in to submit")}
          </Link>
        </Button>
      )}

      <h2 className="flex items-center gap-2 pt-2 font-bold">
        {t("提案", "Entries")}
        <span className="text-muted-foreground text-sm">
          {proposals.length}
        </span>
      </h2>
      {proposals.length === 0 && (
        <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
          {isOpen
            ? t(
                "まだ提案はありません。最初の提案をしてみませんか？",
                "No entries yet. Be the first!",
              )
            : t("提案はありませんでした", "There were no entries")}
        </p>
      )}

      {/* 2 段目: 提案、3 段目: コメント */}
      <ol className="flex flex-col gap-3">
        {proposals.map((proposal) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            users={users}
            viewerUserId={auth.userId}
            isOpen={isOpen}
            canAward={isRequester && isOpen}
            busy={busy}
            onAward={() => setAwardTarget(proposal)}
            onAct={(body, done) =>
              act({ op: "proposal-action", id: proposal.id, ...body }, done)
            }
            onReport={() =>
              void report({ op: "proposal-action", id: proposal.id })
            }
          />
        ))}
      </ol>

      <AlertDialog
        open={awardTarget !== null}
        onOpenChange={(open) => !open && setAwardTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("この提案を採用しますか？", "Pick this entry?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `${users[awardTarget?.userId ?? ""]?.name ?? "提案者"}さんに報酬が届き、募集は終了します。採用は取り消せません。`,
                `The reward goes to ${users[awardTarget?.userId ?? ""]?.name ?? "the creator"} and the request closes. This cannot be undone.`,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {awardTarget?.imageUrls[0] && (
            <img
              src={awardTarget.imageUrls[0]}
              alt=""
              className="max-h-64 w-full rounded-xl object-contain"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("やめる", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = awardTarget
                setAwardTarget(null)
                if (!target) return
                void act(
                  {
                    op: "action",
                    id: request.id,
                    action: "award",
                    proposalId: target.id,
                  },
                  t("🏆 採用しました", "🏆 Picked"),
                )
              }}
            >
              {t("採用する", "Pick")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProposalItem(props: {
  proposal: OpenRequestProposal
  users: RequestUsers
  viewerUserId: string | null
  isOpen: boolean
  canAward: boolean
  busy: boolean
  onAward: () => void
  onAct: (body: Record<string, unknown>, done?: string) => Promise<boolean>
  onReport: () => void
}) {
  const t = useTranslation()
  const { proposal } = props
  const isMine =
    props.viewerUserId !== null && props.viewerUserId === proposal.userId
  const [comment, setComment] = useState("")
  const [showComments, setShowComments] = useState(
    proposal.comments.length > 0 && proposal.comments.length <= 3,
  )

  return (
    <li
      id={`proposal-${proposal.id}`}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-4",
        proposal.isAwarded && "border-amber-400 ring-2 ring-amber-400/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <RequestUserChip user={props.users[proposal.userId]} />
        <div className="flex items-center gap-2">
          {proposal.isAwarded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 font-bold text-[11px] text-amber-950">
              <Trophy className="size-3" />
              {t("採用", "Picked")}
            </span>
          )}
          <span className="text-muted-foreground text-xs">
            {formatDateTime(proposal.createdAt)}
          </span>
        </div>
      </div>
      <RequestImageGrid
        urls={proposal.imageUrls}
        className="grid-cols-2 sm:grid-cols-2"
      />
      {proposal.workId && (
        <Link
          to={`/posts/${proposal.workId}`}
          className="w-fit text-primary text-xs underline"
        >
          {t("作品のページを見る", "View the work")}
        </Link>
      )}
      {proposal.message && (
        <p className="whitespace-pre-wrap text-sm">
          <AutoTranslatedInline text={proposal.message} />
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full",
            proposal.isLikedByMe && "text-rose-500",
          )}
          disabled={props.busy || isMine || !props.isOpen}
          onClick={() =>
            void props.onAct({
              action: proposal.isLikedByMe ? "unlike" : "like",
            })
          }
        >
          <Heart
            className={cn(
              "mr-1 size-4",
              proposal.isLikedByMe && "fill-current",
            )}
          />
          {proposal.likeCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => setShowComments((v) => !v)}
        >
          <MessageCircle className="mr-1 size-4" />
          {proposal.comments.length}
        </Button>
        {props.canAward && (
          <Button
            size="sm"
            className="ml-auto rounded-full bg-amber-500 font-bold text-white hover:bg-amber-600"
            disabled={props.busy}
            onClick={props.onAward}
          >
            <Trophy className="mr-1 size-4" />
            {t("採用する", "Pick")}
          </Button>
        )}
        {isMine && props.isOpen && !proposal.isAwarded && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full text-muted-foreground"
            disabled={props.busy}
            onClick={() => {
              if (
                !window.confirm(
                  t("この提案を取り下げますか？", "Withdraw this entry?"),
                )
              )
                return
              void props.onAct(
                { action: "withdraw" },
                t("提案を取り下げました", "Entry withdrawn"),
              )
            }}
          >
            <Undo2 className="mr-1 size-4" />
            {t("取り下げる", "Withdraw")}
          </Button>
        )}
        {!isMine && props.viewerUserId && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground",
              !props.canAward && "ml-auto",
            )}
            onClick={props.onReport}
          >
            <Flag className="size-3.5" />
            {t("通報", "Report")}
          </button>
        )}
      </div>

      {showComments && (
        <div className="flex flex-col gap-2 border-l-2 pl-3">
          {proposal.comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <RequestUserChip user={props.users[c.userId]} />
                <span className="text-[11px] text-muted-foreground">
                  {formatDateTime(c.createdAt)}
                </span>
                {props.viewerUserId === c.userId && (
                  <button
                    type="button"
                    className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      void props.onAct({
                        action: "delete-comment",
                        commentId: c.id,
                      })
                    }
                  >
                    {t("削除", "Delete")}
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap pl-8 text-sm">{c.body}</p>
            </div>
          ))}
          {props.viewerUserId && (
            <form
              className="flex items-center gap-2"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!comment.trim()) return
                if (await props.onAct({ action: "comment", body: comment }))
                  setComment("")
              }}
            >
              <Input
                value={comment}
                maxLength={500}
                placeholder={t("コメントする", "Add a comment")}
                onChange={(e) => setComment(e.target.value)}
                className="h-9 rounded-full"
              />
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0 rounded-full"
                disabled={props.busy || !comment.trim()}
              >
                <Send className="size-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </li>
  )
}

function ProposalForm(props: {
  requestId: string
  remaining: number
  onDone: () => Promise<void>
}) {
  const t = useTranslation()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [workUrl, setWorkUrl] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const workId = workUrl.trim() ? parseWorkId(workUrl) : null
  const canSubmit =
    !submitting &&
    (imageUrls.length > 0 || workId !== null) &&
    !(workUrl.trim() && !workId)

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await openRequestsPost({
        op: "propose",
        id: props.requestId,
        imageUrls,
        workId,
        message,
      })
      toast.success(t("提案しました", "Entry submitted"))
      setImageUrls([])
      setWorkUrl("")
      setMessage("")
      await props.onDone()
    } catch (error) {
      toast.error(openRequestErrorMessage(error, t.isEnglish))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-amber-400/60 border-dashed bg-amber-500/5 p-4">
      <p className="font-bold text-sm">
        {t(
          `提案する（あと ${props.remaining} 件）`,
          `Submit an entry (${props.remaining} left)`,
        )}
      </p>
      <RequestImagePicker
        value={imageUrls}
        onChange={setImageUrls}
        max={4}
        maxSide={2048}
      />
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">
          {t(
            "または投稿済みの自分の作品（URL か ID）",
            "Or one of your posted works (URL or ID)",
          )}
        </span>
        <Input
          value={workUrl}
          placeholder="https://www.aipictors.com/posts/123456"
          onChange={(e) => setWorkUrl(e.target.value)}
        />
      </label>
      <Textarea
        value={message}
        maxLength={500}
        rows={2}
        placeholder={t("ひとこと（任意）", "A short message (optional)")}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="text-muted-foreground text-xs">
        {t(
          "提案した画像はみんなが見られます。採用されると、手数料を引いた報酬が届きます。",
          "Your entry is visible to everyone. If picked, you receive the reward minus the fee.",
        )}
      </p>
      <Button
        className="h-11 rounded-full font-bold"
        disabled={!canSubmit}
        onClick={submit}
      >
        {submitting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          t("提案する", "Submit")
        )}
      </Button>
    </section>
  )
}
