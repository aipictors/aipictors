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
import { RequestShowcaseBadge } from "~/components/requests/request-showcase"
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
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
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
  const t = useTranslation()
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
      setError(requestErrorMessage(e, t.isEnglish))
    }
  }, [id, t.isEnglish])

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
      toast.error(requestErrorMessage(e, t.isEnglish))
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
          <Link to="/login">{t("ログインして見る", "Log in to view")}</Link>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pt-4 pb-28 md:px-6">
      <Link
        to="/requests/manage"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("依頼の管理", "Manage requests")}
      </Link>

      {searchParams.get("created") === "1" && request.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 p-4 text-white">
          <PartyPopper className="size-6 shrink-0" />
          <div>
            <p className="font-bold">
              {t("リクエストを送りました", "Request sent")}
            </p>
            <p className="text-sm text-white/90">
              {t(
                `クリエイターの承諾を待っています（${formatDateTime(request.respondBy)} まで）。返事がなければコインは全額戻ります。`,
                `Waiting for the creator to accept (until ${formatDateTime(request.respondBy)}). If there is no reply, all your coins are returned.`,
              )}
            </p>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-3xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {isCreator
                ? t("受けた依頼", "Received request")
                : t("出した依頼", "Sent request")}
              {t("・", " · ")}
              {request.planTitle
                ? t(
                    `プラン「${request.planTitle}」`,
                    `Plan "${request.planTitle}"`,
                  )
                : t("自由リクエスト", "Open request")}
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
              {isCreator
                ? t("依頼者", "Requester")
                : t("クリエイター", "Creator")}
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
          <h2 className="font-bold">{t("納品", "Delivery")}</h2>
          {request.deliveryMessage && (
            <p className="whitespace-pre-wrap text-sm">
              {request.deliveryMessage}
            </p>
          )}
          <RequestImageGrid urls={request.deliveryImageUrls} />
          {request.deliveryImageUrls.length > 0 && (
            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <Download className="size-3.5" />
              {t(
                "画像をタップすると元の大きさで開きます（保存できます）",
                "Tap an image to open it at full size (you can save it)",
              )}
            </p>
          )}
          {request.deliveredWorkId && (
            <Link
              to={`/posts/${request.deliveredWorkId}`}
              className="text-sm underline"
            >
              {t("投稿された作品を見る", "View the posted work")}
            </Link>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-3xl border p-4">
        <h2 className="font-bold">
          {t("リクエストの内容", "Request details")}
        </h2>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {request.body}
        </p>
        <RequestImageGrid urls={request.referenceImageUrls} />
        <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
          <span>
            {t(
              `納期 ${request.deliveryDays} 日`,
              `Delivery: ${request.deliveryDays} days`,
            )}
          </span>
          <span>
            {t(
              `修正 残り ${request.revisionLeft} 回`,
              `Revisions left: ${request.revisionLeft}`,
            )}
          </span>
          {request.isR18 && (
            <span className="font-bold text-rose-500">
              {t("R18（報酬の対象外）", "R18 (not eligible for rewards)")}
            </span>
          )}
          <span>
            {t(
              `申し込み ${formatDateTime(request.createdAt)}`,
              `Applied ${formatDateTime(request.createdAt)}`,
            )}
          </span>
        </div>
        {request.escrow && (
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs">
            {t(
              `預かり中のコイン: 無料 ${formatCoins(request.escrow.freeCoins)}・プレミアム ${formatCoins(request.escrow.premiumCoins)}（お断り・キャンセル・期限切れのときは同じ内訳で戻ります）`,
              `Coins held: Free ${formatCoins(request.escrow.freeCoins, true)} · Premium ${formatCoins(request.escrow.premiumCoins, true)} (returned in the same breakdown if declined, canceled, or expired)`,
            )}
          </p>
        )}
      </section>

      <ShowcaseSettings request={request} busy={busy} act={act} />

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
          const reason = window.prompt(
            t(
              "通報の理由（運営だけが見ます）",
              "Reason for reporting (only visible to staff)",
            ),
          )
          if (reason)
            await act(
              "report",
              { reason },
              t(
                "通報しました。運営が確認します",
                "Reported. Our staff will review it",
              ),
            )
        }}
      >
        <Flag className="size-3.5" />
        {t("この取引を運営に知らせる", "Report this request to staff")}
      </button>
    </div>
  )
}

/** 実績として公開するか（依頼者は許可・取り消し、クリエイターは自分の実績から外せる）。R18 と終わった（完了以外）依頼には出さない */
function ShowcaseSettings(props: {
  request: CoinRequest
  busy: string | null
  act: (
    action: string,
    extra?: Record<string, unknown>,
    success?: string,
  ) => Promise<boolean>
}) {
  const t = useTranslation()
  const { request } = props
  const closedWithoutWork = [
    "DECLINED",
    "CANCELED",
    "EXPIRED",
    "ADMIN_CANCELED",
  ].includes(request.status)
  if (request.isR18 || closedWithoutWork) return null
  const isCreator = request.role === "CREATOR"
  const allowed = request.showcaseAllowed === true
  const done =
    request.status === "COMPLETED" || request.status === "ADMIN_COMPLETED"
  // クリエイターには、許可されているときだけ出す
  if (isCreator && !allowed) return null

  const status = (() => {
    if (!allowed) return null
    if (!done) {
      return t(
        "取引が完了すると、透かし入りで実績に載ります",
        "It will be shown with a watermark once the request is completed",
      )
    }
    if (request.showcaseImageUrls === null) {
      return t(
        "透かし入りの画像を準備しています（数分かかります）",
        "Preparing the watermarked image (takes a few minutes)",
      )
    }
    if (request.showcaseImageUrls?.length === 0) {
      return t(
        "載せられる画像がありませんでした",
        "There were no images that could be shown",
      )
    }
    if (request.showcaseHidden) {
      return t(
        "クリエイターが実績に載せていません",
        "The creator has chosen not to show it",
      )
    }
    return t(
      "プランとクリエイターのページの実績に載っています",
      "Shown on the plan and the creator's profile",
    )
  })()

  return (
    <section className="flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-bold text-sm">
            {t("実績としての公開", "Showing as a work")}
            <RequestShowcaseBadge />
          </p>
          <p className="text-muted-foreground text-xs">
            {isCreator
              ? t(
                  "依頼者が、完成した作品を実績として公開することを許可しています（透かし入り）",
                  "The requester allows the finished work to be shown (watermarked)",
                )
              : t(
                  "完成した作品を、透かしを入れてクリエイターのプランやマイページの実績に載せてよいか選べます。いつでも変えられます",
                  "Choose whether the finished work may be shown with a watermark on the creator's plan and profile. You can change this anytime",
                )}
          </p>
        </div>
        <Switch
          checked={isCreator ? !request.showcaseHidden : allowed}
          disabled={props.busy !== null}
          onCheckedChange={(value) =>
            isCreator
              ? props.act(
                  "showcase-hide",
                  { hidden: !value },
                  value
                    ? t("実績に載せました", "Now shown in your works")
                    : t("実績から外しました", "Removed from your works"),
                )
              : props.act(
                  "showcase",
                  { allowed: value },
                  value
                    ? t("公開を許可しました", "Permission granted")
                    : t("許可を取り消しました", "Permission withdrawn"),
                )
          }
        />
      </div>
      {status && <p className="text-muted-foreground text-xs">{status}</p>}
      {allowed &&
        request.showcaseImageUrls &&
        request.showcaseImageUrls.length > 0 && (
          <div className="flex gap-2">
            {request.showcaseImageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="size-20 rounded-xl bg-muted object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
    </section>
  )
}

function Deadline(props: { request: CoinRequest; isCreator: boolean }) {
  const t = useTranslation()
  const r = props.request
  const line = (() => {
    if (r.status === "PENDING")
      return {
        label: props.isCreator
          ? t("承諾の期限", "Accept by")
          : t("承諾待ち（期限）", "Awaiting acceptance (deadline)"),
        at: r.respondBy,
      }
    if (r.status === "ACCEPTED") return { label: t("納期", "Due"), at: r.dueAt }
    if (r.status === "DELIVERED")
      return {
        label: t("自動で受け取り完了", "Auto-completes"),
        at: r.autoCompleteAt,
      }
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
      <span className="font-bold">{formatRemaining(line.at, t.isEnglish)}</span>
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
  const t = useTranslation()
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
        title={t("リクエストが届きました", "You received a request")}
        body={t(
          "内容を確認して、承諾かお断りをしてください。お断りするとコインは依頼者に全額戻ります。",
          "Check the details and accept or decline. If you decline, all coins are returned to the requester.",
        )}
      >
        {mode === "decline" ? (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={t(
                "お断りの理由（任意・依頼者に表示されます）",
                "Reason for declining (optional, shown to the requester)",
              )}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                {t("戻る", "Back")}
              </Button>
              <Button
                variant="destructive"
                className={btn}
                disabled={busy !== null}
                onClick={() =>
                  act(
                    "decline",
                    { reason: text },
                    t("お断りしました", "Request declined"),
                  )
                }
              >
                {t("お断りする", "Decline")}
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
              {t("お断りする", "Decline")}
            </Button>
            <Button
              className={btn}
              disabled={busy !== null}
              onClick={() =>
                act(
                  "accept",
                  {},
                  t(
                    "承諾しました。納期までに納品してください",
                    "Accepted. Please deliver by the due date",
                  ),
                )
              }
            >
              {busy === "accept" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                t("承諾する", "Accept")
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
        title={t("制作中", "In progress")}
        body={t(
          "できあがったら画像を納品してください。依頼者が受け取りを完了すると取引完了です。",
          "Deliver the images when they're ready. The request is completed when the requester confirms receipt.",
        )}
      >
        {mode === "deliver" ? (
          <>
            <RequestImagePicker
              value={images}
              onChange={setImages}
              max={10}
              maxSide={4096}
              label={t("納品", "Delivery")}
            />
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={t("メッセージ（任意）", "Message (optional)")}
            />
            <Input
              value={workUrl}
              onChange={(e) => setWorkUrl(e.target.value)}
              placeholder={t(
                "作品として投稿した場合は作品の URL（任意）",
                "URL of the work, if you posted it (optional)",
              )}
            />
            <p className="text-muted-foreground text-xs">
              {t(
                "作品として投稿するかは自由です。投稿する場合は",
                "Posting it as a work is up to you. To post it, use",
              )}
              <Link to="/new/image" target="_blank" className="mx-1 underline">
                {t("新規投稿", "New post")}
              </Link>
              {t(
                "で投稿してから URL を入れてください。",
                "first, then enter the URL.",
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                {t("戻る", "Back")}
              </Button>
              <Button
                className={btn}
                disabled={busy !== null || (images.length === 0 && !workId)}
                onClick={async () => {
                  if (
                    await act(
                      "deliver",
                      { imageUrls: images, message: text, workId },
                      t("納品しました", "Delivered"),
                    )
                  ) {
                    setMode(null)
                    setText("")
                  }
                }}
              >
                {t("納品する", "Deliver")}
              </Button>
            </div>
          </>
        ) : (
          <Button
            className={cn(btn, "w-full")}
            onClick={() => setMode("deliver")}
          >
            {t("納品する", "Deliver")}
          </Button>
        )}
      </Panel>
    )
  }

  if (!isCreator && r.status === "PENDING") {
    return (
      <Panel
        title={t("承諾を待っています", "Waiting for acceptance")}
        body={t(
          "承諾されるまでは取り下げられます。取り下げるとコインは全額戻ります。",
          "You can withdraw until it is accepted. If you withdraw, all your coins are returned.",
        )}
      >
        <Button
          variant="secondary"
          className={cn(btn, "w-full")}
          disabled={busy !== null}
          onClick={() =>
            window.confirm(
              t(
                "リクエストを取り下げますか？コインは全額戻ります",
                "Withdraw this request? All your coins will be returned",
              ),
            ) &&
            act(
              "cancel",
              {},
              t(
                "取り下げました。コインを返却しました",
                "Withdrawn. Your coins have been returned",
              ),
            )
          }
        >
          {t("取り下げる", "Withdraw")}
        </Button>
      </Panel>
    )
  }

  if (!isCreator && r.status === "ACCEPTED") {
    return (
      <Panel
        title={
          props.overdue
            ? t("納期を過ぎています", "Past the due date")
            : t("制作中です", "In progress")
        }
        body={
          props.overdue
            ? t(
                "キャンセルするとコインは全額戻ります。納期から 3 日たつと自動でキャンセルされます。",
                "If you cancel, all your coins are returned. It is canceled automatically 3 days after the due date.",
              )
            : t(
                "納品されたらお知らせします。メッセージでやり取りもできます。",
                "We'll notify you when it's delivered. You can also exchange messages.",
              )
        }
      >
        {props.overdue && (
          <Button
            variant="secondary"
            className={cn(btn, "w-full")}
            disabled={busy !== null}
            onClick={() =>
              act(
                "cancel",
                {},
                t(
                  "キャンセルしました。コインを返却しました",
                  "Canceled. Your coins have been returned",
                ),
              )
            }
          >
            {t("キャンセルしてコインを戻す", "Cancel and get coins back")}
          </Button>
        )}
      </Panel>
    )
  }

  if (!isCreator && r.status === "DELIVERED") {
    return (
      <Panel
        title={t("納品が届きました", "Delivery received")}
        body={t(
          "内容を確認して「受け取り完了」を押してください。7 日たつと自動で完了します。",
          'Check the delivery and press "Confirm receipt". It completes automatically after 7 days.',
        )}
      >
        {mode === "revise" ? (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={t(
                "直してほしいところを具体的に",
                "Describe exactly what you'd like changed",
              )}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={btn}
                onClick={() => setMode(null)}
              >
                {t("戻る", "Back")}
              </Button>
              <Button
                className={btn}
                disabled={busy !== null || !text.trim()}
                onClick={async () => {
                  if (
                    await act(
                      "revise",
                      { message: text },
                      t("修正をお願いしました", "Revision requested"),
                    )
                  )
                    setMode(null)
                }}
              >
                {t("修正をお願いする", "Request a revision")}
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
                {t(
                  `修正をお願いする（残り ${r.revisionLeft} 回）`,
                  `Request a revision (${r.revisionLeft} left)`,
                )}
              </Button>
            )}
            <Button
              className={btn}
              disabled={busy !== null}
              onClick={() =>
                window.confirm(
                  t(
                    "受け取りを完了しますか？完了するとコインがクリエイターに渡ります",
                    "Confirm receipt? Once confirmed, the coins go to the creator",
                  ),
                ) &&
                act(
                  "complete",
                  {},
                  t(
                    "取引が完了しました。ありがとうございました",
                    "The request is complete. Thank you!",
                  ),
                )
              }
            >
              {t("受け取り完了", "Confirm receipt")}
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
      DECLINED: t(
        "クリエイターがお断りしました。",
        "The creator declined the request.",
      ),
      CANCELED: t(
        "依頼は取り下げ・キャンセルされました。",
        "The request was withdrawn or canceled.",
      ),
      EXPIRED:
        r.closedReason === "overdue"
          ? t(
              "納期を過ぎたため自動でキャンセルされました。",
              "It was canceled automatically because the due date passed.",
            )
          : t(
              "期限までに承諾されませんでした。",
              "It was not accepted before the deadline.",
            ),
      ADMIN_CANCELED: t("運営がキャンセルしました。", "Canceled by staff."),
    }
    const refund = isCreator
      ? ""
      : t(
          `${formatCoins(r.priceCoins)} コインは全額戻っています。`,
          ` All ${formatCoins(r.priceCoins, true)} coins have been returned.`,
        )
    return (
      <Panel
        title={t("この依頼は終了しました", "This request has ended")}
        body={`${reason[r.status]}${refund}`}
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
  const t = useTranslation()
  const s = props.request.settlement
  if (!s) return null
  if (!props.isCreator) {
    return (
      <Panel
        title={t("取引が完了しました", "Request completed")}
        body={t(
          "ご依頼ありがとうございました。納品された画像はいつでもこのページから見られます。",
          "Thank you for your request. You can view the delivered images on this page at any time.",
        )}
      />
    )
  }
  return (
    <section className="flex flex-col gap-2 rounded-3xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <p className="font-bold">
        {t("取引が完了しました", "Request completed")}
      </p>
      <dl className="grid gap-1 text-sm">
        {s.earnedYen > 0 && (
          <div className="flex justify-between">
            <dt>
              {t(
                "報酬（7 日後から振込の対象）",
                "Reward (eligible for payout after 7 days)",
              )}
            </dt>
            <dd className="font-bold">
              {t(
                `${s.earnedYen.toLocaleString("ja-JP")} 円`,
                `¥${s.earnedYen.toLocaleString("en-US")}`,
              )}
            </dd>
          </div>
        )}
        {s.premiumCoins > 0 && (
          <div className="flex justify-between">
            <dt>{t("プレミアムコイン", "Premium coins")}</dt>
            <dd className="font-bold">
              {formatCoins(s.premiumCoins, t.isEnglish)}
            </dd>
          </div>
        )}
        {s.freeCoins > 0 && (
          <div className="flex justify-between">
            <dt>{t("無料コイン", "Free coins")}</dt>
            <dd className="font-bold">
              {formatCoins(s.freeCoins, t.isEnglish)}
            </dd>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground text-xs">
          <dt>{t("手数料（10%）", "Fee (10%)")}</dt>
          <dd>
            {t(
              `${formatCoins(s.feeCoins)} コイン`,
              `${formatCoins(s.feeCoins, true)} coins`,
            )}
          </dd>
        </div>
      </dl>
      {s.earnedYen > 0 && (
        <Link to="/settings/creator-rewards" className="text-sm underline">
          {t("報酬の明細と振込", "Reward details and payouts")}
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
  const t = useTranslation()
  const [text, setText] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [showImages, setShowImages] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const messages = props.request.messages ?? []
  return (
    <section className="flex flex-col gap-3 rounded-3xl border p-4">
      <h2 className="font-bold">{t("メッセージ", "Messages")}</h2>
      <div className="flex flex-col gap-2">
        {messages.map((m) => {
          if (m.senderUserId === null) {
            return (
              <p
                key={m.id}
                className="mx-auto whitespace-pre-wrap rounded-full bg-muted px-3 py-1 text-center text-[11px] text-muted-foreground"
              >
                {m.body}
                {t("・", " · ")}
                {formatDateTime(m.createdAt)}
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
          {t("画像", "Images")}
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder={t("メッセージを書く", "Write a message")}
          className="min-h-10 flex-1 resize-none"
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          aria-label={t("送る", "Send")}
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
        {t(
          "サイトの外での取引や連絡先の交換は禁止です。",
          "Transactions outside the site and exchanging contact details are prohibited.",
        )}
      </p>
    </section>
  )
}
