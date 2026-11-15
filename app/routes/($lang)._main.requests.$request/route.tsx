import type { MetaFunction } from "@remix-run/cloudflare"
import { useParams, useSearchParams } from "@remix-run/react"
import {
  CalendarClock,
  ChevronLeft,
  Download,
  Flag,
  Loader2,
  PartyPopper,
  Send,
} from "lucide-react"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { RequestImagePicker } from "~/components/requests/request-image-picker"
import {
  CoinPrice,
  RequestImageGrid,
  RequestStatusBadge,
  RequestSteps,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import {
  type CoinRequest,
  formatCoins,
  formatDateTime,
  formatRemaining,
  requestErrorMessage,
  requestsGet,
  requestsPost,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(META.REQUEST_DETAIL, undefined, props.params.lang)

export default function RequestDetailPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const auth = useContext(AuthContext)
  const id = String(params.request ?? "")
  const [request, setRequest] = useState<CoinRequest | null>(null)
  const [users, setUsers] = useState<RequestUsers>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await requestsGet<{
        request: CoinRequest
        users: RequestUsers
      }>({ op: "detail", id })
      setRequest(data.request)
      setUsers(data.users)
    } catch (e) {
      setError(requestErrorMessage(e))
    }
  }, [id])

  useEffect(() => {
    if (auth.isLoggedIn) void load()
  }, [auth.isLoggedIn, load])

  const act = async (
    action: string,
    extra: Record<string, unknown> = {},
    success?: string,
  ) => {
    setBusy(action)
    try {
      const data = await requestsPost<{ request: CoinRequest | null }>({
        op: "action",
        id,
        action,
        ...extra,
      })
      if (data.request) setRequest(data.request)
      else await load()
      if (success) toast.success(success)
      return true
    } catch (e) {
      toast.error(requestErrorMessage(e))
      await load()
      return false
    } finally {
      setBusy(null)
    }
  }

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Button asChild className="rounded-full">
          <Link to="/login">ログインして見る</Link>
        </Button>
      </div>
    )
  }
  if (error)
    return (
      <p className="px-6 py-16 text-center text-muted-foreground">{error}</p>
    )
  if (!request) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isCreator = request.role === "CREATOR"
  const other =
    users[isCreator ? request.requesterUserId : request.creatorUserId]
  const now = Math.floor(Date.now() / 1000)
  const overdue =
    request.status === "ACCEPTED" &&
    request.dueAt !== null &&
    now > request.dueAt

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pt-3 pb-28 md:px-6">
      <Link
        to="/requests"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        依頼の管理
      </Link>

      {searchParams.get("created") === "1" && request.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 p-4 text-white">
          <PartyPopper className="size-6 shrink-0" />
          <div>
            <p className="font-bold">リクエストを送りました</p>
            <p className="text-sm text-white/90">
              クリエイターの承諾を待っています（
              {formatDateTime(request.respondBy)}{" "}
              まで）。返事がなければコインは全額戻ります。
            </p>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-3xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {isCreator ? "受けた依頼" : "出した依頼"}・
              {request.planTitle
                ? `プラン「${request.planTitle}」`
                : "自由リクエスト"}
            </p>
            <h1 className="mt-1 font-bold text-lg leading-snug">
              {request.title}
            </h1>
          </div>
          <RequestStatusBadge status={request.status} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {isCreator ? "依頼者" : "クリエイター"}
            </span>
            <RequestUserChip user={other} />
          </div>
          <CoinPrice coins={request.priceCoins} className="text-lg" />
        </div>
        <RequestSteps request={request} />
        <Deadline request={request} isCreator={isCreator} />
      </section>

      <ActionPanel
        request={request}
        isCreator={isCreator}
        overdue={overdue}
        busy={busy}
        act={act}
      />

      {request.status === "COMPLETED" ||
      request.status === "ADMIN_COMPLETED" ? (
        <Settlement request={request} isCreator={isCreator} />
      ) : null}

      {(request.deliveryImageUrls.length > 0 || request.deliveredWorkId) && (
        <section className="flex flex-col gap-3 rounded-3xl border p-4">
          <h2 className="font-bold">納品</h2>
          {request.deliveryMessage && (
            <p className="whitespace-pre-wrap text-sm">
              {request.deliveryMessage}
            </p>
          )}
          <RequestImageGrid urls={request.deliveryImageUrls} />
          {request.deliveryImageUrls.length > 0 && (
            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <Download className="size-3.5" />
              画像をタップすると元の大きさで開きます（保存できます）
            </p>
          )}
          {request.deliveredWorkId && (
            <Link
              to={`/posts/${request.deliveredWorkId}`}
              className="text-sm underline"
            >
              投稿された作品を見る
            </Link>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-3xl border p-4">
        <h2 className="font-bold">リクエストの内容</h2>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {request.body}
        </p>
        <RequestImageGrid urls={request.referenceImageUrls} />
        <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
          <span>納期 {request.deliveryDays} 日</span>
          <span>修正 残り {request.revisionLeft} 回</span>
          {request.isR18 && (
            <span className="font-bold text-rose-500">R18（報酬の対象外）</span>
          )}
          <span>申し込み {formatDateTime(request.createdAt)}</span>
        </div>
        {request.escrow && (
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs">
            預かり中のコイン: 無料 {formatCoins(request.escrow.freeCoins)}
            ・プレミアム {formatCoins(request.escrow.premiumCoins)}
            （お断り・キャンセル・期限切れのときは同じ内訳で戻ります）
          </p>
        )}
      </section>

      <MessageThread
        request={request}
        users={users}
        viewerId={auth.userId}
        busy={busy}
        act={act}
      />

      <button
        type="button"
        className="flex w-fit items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
        onClick={async () => {
          const reason = window.prompt("通報の理由（運営だけが見ます）")
          if (reason)
            await act("report", { reason }, "通報しました。運営が確認します")
        }}
      >
        <Flag className="size-3.5" />
        この取引を運営に知らせる
      </button>
    </div>
  )
}

function Deadline(props: { request: CoinRequest; isCreator: boolean }) {
  const r = props.request
  const line = (() => {
    if (r.status === "PENDING")
      return {
        label: props.isCreator ? "承諾の期限" : "承諾待ち（期限）",
        at: r.respondBy,
      }
    if (r.status === "ACCEPTED") return { label: "納期", at: r.dueAt }
    if (r.status === "DELIVERED")
      return { label: "自動で受け取り完了", at: r.autoCompleteAt }
    return null
  })()
  if (!line?.at) return null
  const urgent = line.at - Math.floor(Date.now() / 1000) < 86400
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2 text-sm",
        urgent
          ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300"
          : "bg-muted/60",
      )}
    >
      <span className="flex items-center gap-1.5">
        <CalendarClock className="size-4" />
        {line.label} {formatDateTime(line.at)}
      </span>
      <span className="font-bold">{formatRemaining(line.at)}</span>
    </div>
  )
}

type ActFn = (
  action: string,
  extra?: Record<string, unknown>,
  success?: string,
) => Promise<boolean>

function ActionPanel(props: {
  request: CoinRequest
  isCreator: boolean
  overdue: boolean
  busy: string | null
  act: ActFn
}) {
  const { request: r, isCreator, act, busy } = props
  const [mode, setMode] = useState<null | "decline" | "deliver" | "revise">(
    null,
  )
  const [text, setText] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [workUrl, setWorkUrl] = useState("")
  const btn = "h-12 flex-1 rounded-full font-bold"

  if (isCreator && r.status === "PENDING") {
    return (
      <Panel
        title="リクエストが届きました"
        body="内容を確認して、承諾かお断りをしてください。お断りするとコインは依頼者に全額戻ります。"
      >
        {mode === "decline" ? (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="お断りの理由（任意・依頼者に表示されます）"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                戻る
              </Button>
              <Button
                variant="destructive"
                className={btn}
                disabled={busy !== null}
                onClick={() =>
                  act("decline", { reason: text }, "お断りしました")
                }
              >
                お断りする
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className={btn}
              onClick={() => setMode("decline")}
            >
              お断りする
            </Button>
            <Button
              className={btn}
              disabled={busy !== null}
              onClick={() =>
                act("accept", {}, "承諾しました。納期までに納品してください")
              }
            >
              {busy === "accept" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "承諾する"
              )}
            </Button>
          </div>
        )}
      </Panel>
    )
  }

  if (isCreator && r.status === "ACCEPTED") {
    const workId = workUrl.match(/(\d{3,})/)?.[1] ?? null
    return (
      <Panel
        title="制作中"
        body="できあがったら画像を納品してください。依頼者が受け取りを完了すると取引完了です。"
      >
        {mode === "deliver" ? (
          <>
            <RequestImagePicker
              value={images}
              onChange={setImages}
              max={10}
              maxSide={4096}
              label="納品"
            />
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="メッセージ（任意）"
            />
            <Input
              value={workUrl}
              onChange={(e) => setWorkUrl(e.target.value)}
              placeholder="作品として投稿した場合は作品の URL（任意）"
            />
            <p className="text-muted-foreground text-xs">
              作品として投稿するかは自由です。投稿する場合は
              <Link to="/new/image" target="_blank" className="mx-1 underline">
                新規投稿
              </Link>
              で投稿してから URL を入れてください。
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                戻る
              </Button>
              <Button
                className={btn}
                disabled={busy !== null || (images.length === 0 && !workId)}
                onClick={async () => {
                  if (
                    await act(
                      "deliver",
                      { imageUrls: images, message: text, workId },
                      "納品しました",
                    )
                  ) {
                    setMode(null)
                    setText("")
                  }
                }}
              >
                納品する
              </Button>
            </div>
          </>
        ) : (
          <Button
            className={cn(btn, "w-full")}
            onClick={() => setMode("deliver")}
          >
            納品する
          </Button>
        )}
      </Panel>
    )
  }

  if (!isCreator && r.status === "PENDING") {
    return (
      <Panel
        title="承諾を待っています"
        body="承諾されるまでは取り下げられます。取り下げるとコインは全額戻ります。"
      >
        <Button
          variant="secondary"
          className={cn(btn, "w-full")}
          disabled={busy !== null}
          onClick={() =>
            window.confirm(
              "リクエストを取り下げますか？コインは全額戻ります",
            ) && act("cancel", {}, "取り下げました。コインを返却しました")
          }
        >
          取り下げる
        </Button>
      </Panel>
    )
  }

  if (!isCreator && r.status === "ACCEPTED") {
    return (
      <Panel
        title={props.overdue ? "納期を過ぎています" : "制作中です"}
        body={
          props.overdue
            ? "キャンセルするとコインは全額戻ります。納期から 3 日たつと自動でキャンセルされます。"
            : "納品されたらお知らせします。メッセージでやり取りもできます。"
        }
      >
        {props.overdue && (
          <Button
            variant="secondary"
            className={cn(btn, "w-full")}
            disabled={busy !== null}
            onClick={() =>
              act("cancel", {}, "キャンセルしました。コインを返却しました")
            }
          >
            キャンセルしてコインを戻す
          </Button>
        )}
      </Panel>
    )
  }

  if (!isCreator && r.status === "DELIVERED") {
    return (
      <Panel
        title="納品が届きました"
        body="内容を確認して「受け取り完了」を押してください。7 日たつと自動で完了します。"
      >
        {mode === "revise" ? (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="直してほしいところを具体的に"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                戻る
              </Button>
              <Button
                className={btn}
                disabled={busy !== null || !text.trim()}
                onClick={async () => {
                  if (
                    await act(
                      "revise",
                      { message: text },
                      "修正をお願いしました",
                    )
                  )
                    setMode(null)
                }}
              >
                修正をお願いする
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            {r.revisionLeft > 0 && (
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode("revise")}
              >
                修正をお願いする（残り {r.revisionLeft} 回）
              </Button>
            )}
            <Button
              className={btn}
              disabled={busy !== null}
              onClick={() =>
                window.confirm(
                  "受け取りを完了しますか？完了するとコインがクリエイターに渡ります",
                ) &&
                act(
                  "complete",
                  {},
                  "取引が完了しました。ありがとうございました",
                )
              }
            >
              受け取り完了
            </Button>
          </div>
        )}
      </Panel>
    )
  }

  if (
    ["DECLINED", "CANCELED", "EXPIRED", "ADMIN_CANCELED"].includes(r.status)
  ) {
    const reason: Record<string, string> = {
      DECLINED: "クリエイターがお断りしました。",
      CANCELED: "依頼は取り下げ・キャンセルされました。",
      EXPIRED:
        r.closedReason === "overdue"
          ? "納期を過ぎたため自動でキャンセルされました。"
          : "期限までに承諾されませんでした。",
      ADMIN_CANCELED: "運営がキャンセルしました。",
    }
    return (
      <Panel
        title="この依頼は終了しました"
        body={`${reason[r.status]}${isCreator ? "" : `${formatCoins(r.priceCoins)} コインは全額戻っています。`}`}
      />
    )
  }
  return null
}

function Panel(props: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-muted/50 p-4">
      <div>
        <p className="font-bold">{props.title}</p>
        <p className="text-muted-foreground text-sm">{props.body}</p>
      </div>
      {props.children}
    </section>
  )
}

function Settlement(props: { request: CoinRequest; isCreator: boolean }) {
  const s = props.request.settlement
  if (!s) return null
  if (!props.isCreator) {
    return (
      <Panel
        title="取引が完了しました"
        body="ご依頼ありがとうございました。納品された画像はいつでもこのページから見られます。"
      />
    )
  }
  return (
    <section className="flex flex-col gap-2 rounded-3xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <p className="font-bold">取引が完了しました</p>
      <dl className="grid gap-1 text-sm">
        {s.earnedYen > 0 && (
          <div className="flex justify-between">
            <dt>報酬（60 日後から振込の対象）</dt>
            <dd className="font-bold">{s.earnedYen.toLocaleString()} 円</dd>
          </div>
        )}
        {s.premiumCoins > 0 && (
          <div className="flex justify-between">
            <dt>プレミアムコイン</dt>
            <dd className="font-bold">{formatCoins(s.premiumCoins)}</dd>
          </div>
        )}
        {s.freeCoins > 0 && (
          <div className="flex justify-between">
            <dt>無料コイン</dt>
            <dd className="font-bold">{formatCoins(s.freeCoins)}</dd>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground text-xs">
          <dt>手数料（10%）</dt>
          <dd>{formatCoins(s.feeCoins)} コイン</dd>
        </div>
      </dl>
      {s.earnedYen > 0 && (
        <Link to="/settings/creator-rewards" className="text-sm underline">
          報酬の明細と振込
        </Link>
      )}
    </section>
  )
}

function MessageThread(props: {
  request: CoinRequest
  users: RequestUsers
  viewerId: string | null
  busy: string | null
  act: ActFn
}) {
  const [text, setText] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [showImages, setShowImages] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const messages = props.request.messages ?? []
  return (
    <section className="flex flex-col gap-3 rounded-3xl border p-4">
      <h2 className="font-bold">メッセージ</h2>
      <div className="flex flex-col gap-2">
        {messages.map((m) => {
          if (m.senderUserId === null) {
            return (
              <p
                key={m.id}
                className="mx-auto whitespace-pre-wrap rounded-full bg-muted px-3 py-1 text-center text-[11px] text-muted-foreground"
              >
                {m.body}・{formatDateTime(m.createdAt)}
              </p>
            )
          }
          const mine = m.senderUserId === props.viewerId
          return (
            <div
              key={m.id}
              className={cn(
                "flex max-w-[85%] flex-col gap-1",
                mine ? "self-end items-end" : "self-start",
              )}
            >
              {!mine && (
                <RequestUserChip
                  user={props.users[m.senderUserId]}
                  link={false}
                />
              )}
              {m.body && (
                <p
                  className={cn(
                    "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {m.body}
                </p>
              )}
              <RequestImageGrid
                urls={m.imageUrls}
                className="w-56 grid-cols-2 sm:grid-cols-2"
              />
              <span className="text-[10px] text-muted-foreground">
                {formatDateTime(m.createdAt)}
              </span>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      {showImages && (
        <RequestImagePicker value={images} onChange={setImages} max={4} />
      )}
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => setShowImages((v) => !v)}
        >
          画像
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="メッセージを書く"
          className="min-h-10 flex-1 resize-none"
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          aria-label="送る"
          disabled={
            props.busy !== null || (!text.trim() && images.length === 0)
          }
          onClick={async () => {
            if (await props.act("message", { body: text, imageUrls: images })) {
              setText("")
              setImages([])
              setShowImages(false)
              setTimeout(
                () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
                50,
              )
            }
          }}
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        サイトの外での取引や連絡先の交換は禁止です。
      </p>
    </section>
  )
}
