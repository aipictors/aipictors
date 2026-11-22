import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { Eye, EyeOff, Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { RequestImagePicker } from "~/components/requests/request-image-picker"
import { CoinPrice } from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  type CreatorRequestProfile,
  formatCoins,
  PLAN_CATEGORY_LABELS,
  planCategoryLabel,
  REQUEST_FEE_RATE,
  type RequestPlan,
  type RequestSettings,
  requestErrorMessage,
  requestsGet,
  requestsPost,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(META.SETTINGS_REQUESTS, undefined, props.params.lang)

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

type PlanDraft = {
  planId?: string
  title: string
  description: string
  category: string
  sampleImageUrls: string[]
  priceCoins: number
  deliveryDays: number
  imageCount: number
  revisionCount: number
  maxActive: number
  isAccepting: boolean
  allowsR18: boolean
  premiumOnly: boolean
  status: "ACTIVE" | "HIDDEN"
}

const emptyDraft = (): PlanDraft => ({
  title: "",
  description: "",
  category: "ILLUSTRATION",
  sampleImageUrls: [],
  priceCoins: 1000,
  deliveryDays: 7,
  imageCount: 1,
  revisionCount: 1,
  maxActive: 3,
  isAccepting: true,
  allowsR18: false,
  premiumOnly: false,
  status: "ACTIVE",
})

const toDraft = (plan: RequestPlan): PlanDraft => ({
  planId: plan.id,
  title: plan.title,
  description: plan.description,
  category: plan.category,
  sampleImageUrls: plan.sampleImageUrls,
  priceCoins: plan.priceCoins,
  deliveryDays: plan.deliveryDays,
  imageCount: plan.imageCount,
  revisionCount: plan.revisionCount,
  maxActive: plan.maxActive,
  isAccepting: plan.isAccepting,
  allowsR18: plan.allowsR18,
  premiumOnly: plan.premiumOnly,
  status: plan.status === "HIDDEN" ? "HIDDEN" : "ACTIVE",
})

/**
 * 自分のプラン: プラン（出品メニュー）の作成・編集と、自由リクエストの受付
 * ?new=1 で新しいプランの入力、?edit=プランID でそのプランの編集を開く（ほかのページの「出品する」「編集する」から来る）
 */
export default function MyRequestPlansPage() {
  const auth = useContext(AuthContext)
  const t = useTranslation()
  const [profile, setProfile] = useState<CreatorRequestProfile | null>(null)
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const load = useCallback(async () => {
    if (!auth.userId) return
    try {
      setProfile(
        await requestsGet<CreatorRequestProfile>({
          op: "creator",
          userId: auth.userId,
        }),
      )
    } catch (e) {
      toast.error(requestErrorMessage(e, t.isEnglish))
    }
  }, [auth.userId, t.isEnglish])

  useEffect(() => {
    void load()
  }, [load])

  // ?new=1・?edit= で来たら入力を開き、閉じたあとに開き直さないよう URL から外す
  useEffect(() => {
    const isNew = searchParams.get("new") === "1"
    const editId = searchParams.get("edit")
    if (!isNew && !editId) return
    if (editId && !profile) return
    if (isNew) {
      setDraft(emptyDraft())
    } else {
      const plan = profile?.plans.find((p) => p.id === editId)
      if (plan) setDraft(toDraft(plan))
    }
    const next = new URLSearchParams(searchParams)
    next.delete("new")
    next.delete("edit")
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }, [searchParams, setSearchParams, profile])

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
        <Store className="size-10 text-muted-foreground" />
        <p className="font-bold">
          {t(
            "プランを出品して、コインで依頼を受けよう",
            "List plans and take requests for coins",
          )}
        </p>
        <p className="text-muted-foreground text-sm">
          {t(
            "ログインすると、プランの作成と依頼の受付ができます。",
            "Log in to create plans and accept requests.",
          )}
        </p>
        <Button asChild className="rounded-full font-bold">
          <Link to="/login">{t("ログインして始める", "Log in to start")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-5 px-3 pt-4 pb-24 md:px-6">
      <section className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-500 p-5 text-white">
        <h1 className="font-bold text-xl">
          {t(
            "プランを出品して、コインで依頼を受けよう",
            "List plans and take requests for coins",
          )}
        </h1>
        <p className="text-sm text-white/90">
          {t(
            "作ったプランはマイページとプラン一覧に並びます。依頼が完了すると、代金から手数料 10% を引いた分を受け取れます（全年齢の依頼で",
            "Your plans appear on your profile and the plan list. When a request is completed, you receive the price minus a 10% fee (for all-ages requests, if you have joined ",
          )}
          <Link to="/settings/creator-rewards" className="underline">
            {t("クリエイター報酬", "Creator Rewards")}
          </Link>
          {t(
            "に参加していれば、有料コインの分は報酬（円）に）。",
            ", the paid-coin portion becomes a reward in yen).",
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="rounded-full font-bold"
            onClick={() => setDraft(emptyDraft())}
          >
            <Plus className="mr-1 size-4" />
            {t("プランを作る", "Create a plan")}
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full font-bold text-white hover:bg-white/15 hover:text-white"
          >
            <Link to="/requests/terms">
              {t("リクエスト規約", "Request terms")}
            </Link>
          </Button>
        </div>
      </section>

      {!profile ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                {t("自分のプラン", "My plans")}
                <span className="ml-1 text-muted-foreground text-sm">
                  {profile.plans.length}/20
                </span>
              </h2>
              {profile.plans.length > 0 && auth.login && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <Link to={`/users/${auth.login}`}>
                    <Store className="mr-1 size-4" />
                    {t("マイページで見る", "View on my profile")}
                  </Link>
                </Button>
              )}
            </div>
            {profile.plans.length === 0 ? (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft())}
                className="flex flex-col items-center gap-2 rounded-3xl border border-dashed px-6 py-10 text-center hover:bg-muted/40"
              >
                <Plus className="size-8 text-muted-foreground" />
                <span className="font-bold">
                  {t("最初のプランを作る", "Create your first plan")}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t(
                    "例: 「アイコン 1 枚 1,000 コイン・納期 7 日・修正 1 回」",
                    'e.g. "1 icon, 1,000 coins, 7-day delivery, 1 revision"',
                  )}
                </span>
              </button>
            ) : (
              <ul className="flex flex-col gap-2">
                {profile.plans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onEdit={() => setDraft(toDraft(plan))}
                    onChanged={load}
                  />
                ))}
              </ul>
            )}
          </section>

          <FreeRequestSettings settings={profile.settings} onSaved={load} />
        </>
      )}

      {draft && (
        <PlanEditor
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null)
            void load()
          }}
        />
      )}
    </div>
  )
}

function PlanRow(props: {
  plan: RequestPlan
  onEdit: () => void
  onChanged: () => void
}) {
  const { plan } = props
  const t = useTranslation()
  const [busy, setBusy] = useState(false)
  const save = async (patch: Partial<PlanDraft>, message: string) => {
    setBusy(true)
    try {
      await requestsPost({ op: "save-plan", ...toDraft(plan), ...patch })
      toast.success(message)
      props.onChanged()
    } catch (e) {
      toast.error(requestErrorMessage(e, t.isEnglish))
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (
      !window.confirm(
        t(
          `プラン「${plan.title}」を削除しますか？（進行中の依頼はそのまま続きます）`,
          `Delete the plan "${plan.title}"? (Requests in progress will continue)`,
        ),
      )
    )
      return
    setBusy(true)
    try {
      await requestsPost({ op: "delete-plan", id: plan.id })
      toast.success(t("削除しました", "Deleted"))
      props.onChanged()
    } catch (e) {
      toast.error(requestErrorMessage(e, t.isEnglish))
    } finally {
      setBusy(false)
    }
  }
  const hidden = plan.status === "HIDDEN"
  return (
    <li
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-3",
        hidden && "opacity-60",
      )}
    >
      <Link
        to={`/requests/plans/${plan.id}`}
        className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {plan.sampleImageUrls[0] && (
          <img
            src={plan.sampleImageUrls[0]}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-bold text-sm">{plan.title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <CoinPrice
            coins={plan.priceCoins}
            className="text-foreground text-sm"
          />
          <span>
            {t(
              `納期 ${plan.deliveryDays} 日`,
              `${plan.deliveryDays}-day delivery`,
            )}
          </span>
          <span>{planCategoryLabel(plan.category, t.isEnglish)}</span>
          {hidden ? (
            <span>{t("非公開", "Hidden")}</span>
          ) : plan.isAccepting ? (
            <span className="text-emerald-600">{t("受付中", "Accepting")}</span>
          ) : (
            <span>{t("受付停止", "Paused")}</span>
          )}
          {plan.allowsR18 && (
            <span className="text-rose-500">{t("R18 可", "R18 OK")}</span>
          )}
          {plan.premiumOnly && (
            <span className="text-fuchsia-600 dark:text-fuchsia-400">
              {t("プレミアムコインのみ", "Premium coins only")}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-0.5">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-full"
            disabled={busy}
            onClick={props.onEdit}
          >
            <Pencil className="mr-1 size-3.5" />
            {t("編集", "Edit")}
          </Button>
          <div className="flex items-center gap-1.5 px-2 text-xs">
            <Switch
              checked={plan.isAccepting}
              disabled={busy}
              onCheckedChange={(v) =>
                save(
                  { isAccepting: v },
                  v
                    ? t("受付を始めました", "Now accepting requests")
                    : t("受付を止めました", "Stopped accepting requests"),
                )
              }
            />
            {t("受付", "Accepting")}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2"
            aria-label={
              hidden ? t("公開する", "Publish") : t("非公開にする", "Hide")
            }
            disabled={busy}
            onClick={() =>
              save(
                { status: hidden ? "ACTIVE" : "HIDDEN" },
                hidden
                  ? t("公開しました", "Published")
                  : t("非公開にしました", "Hidden"),
              )
            }
          >
            {hidden ? (
              <Eye className="size-3.5 sm:mr-1" />
            ) : (
              <EyeOff className="size-3.5 sm:mr-1" />
            )}
            <span className="hidden sm:inline">
              {hidden ? t("公開", "Publish") : t("非公開", "Hide")}
            </span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full px-2 text-rose-500"
            aria-label={t("削除", "Delete")}
            disabled={busy}
            onClick={remove}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  )
}

function NumberField(props: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  suffix: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{props.label}</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={props.min}
          max={props.max}
          value={Number.isFinite(props.value) ? props.value : ""}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="rounded-xl text-base"
        />
        <span className="shrink-0 text-sm">{props.suffix}</span>
      </div>
    </label>
  )
}

function PlanEditor(props: {
  draft: PlanDraft
  onClose: () => void
  onSaved: () => void
}) {
  const t = useTranslation()
  const [d, setD] = useState<PlanDraft>(props.draft)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) =>
    setD((prev) => ({ ...prev, [key]: value }))
  const receive = Math.floor(
    d.priceCoins - Math.ceil(d.priceCoins * REQUEST_FEE_RATE),
  )

  const submit = async () => {
    setSaving(true)
    try {
      await requestsPost({ op: "save-plan", ...d })
      toast.success(
        d.planId
          ? t("プランを保存しました", "Plan saved")
          : t("プランを公開しました", "Plan published"),
      )
      props.onSaved()
    } catch (e) {
      toast.error(requestErrorMessage(e, t.isEnglish))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {d.planId
              ? t("プランを編集", "Edit plan")
              : t("プランを作る", "Create a plan")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {t("タイトル", "Title")}
            </span>
            <Input
              value={d.title}
              maxLength={60}
              placeholder={t(
                "例: ゆるかわアイコン 1 枚",
                "e.g. 1 cute chibi icon",
              )}
              onChange={(e) => set("title", e.target.value)}
              className="rounded-xl text-base"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {t("カテゴリ", "Category")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PLAN_CATEGORY_LABELS).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("category", value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm",
                    d.category === value
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground",
                  )}
                >
                  {planCategoryLabel(value, t.isEnglish)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {t(
                "説明（できること・できないこと・使い方の範囲）",
                "Description (what you can and can't do, permitted uses)",
              )}
            </span>
            <Textarea
              value={d.description}
              rows={6}
              maxLength={4000}
              placeholder={t(
                "例:\n・バストアップのアイコンを 1 枚（1024×1024）\n・背景は単色\n・SNS のアイコンに使えます（商用はご相談）\n・実在の人物、他の作品のキャラクターは受けられません",
                "e.g.\n• 1 bust-up icon (1024×1024)\n• Solid color background\n• OK for social media icons (ask about commercial use)\n• No real people or characters from other works",
              )}
              onChange={(e) => set("description", e.target.value)}
              className="rounded-xl text-base"
            />
          </label>
          <RequestImagePicker
            value={d.sampleImageUrls}
            onChange={(urls) => set("sampleImageUrls", urls)}
            max={4}
            label={t(
              "見本の画像（最大 4 枚、1 枚目がカードに出ます）",
              "Sample images (up to 4; the first appears on the card)",
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t("価格", "Price")}
              value={d.priceCoins}
              min={100}
              max={100000}
              suffix={t("コイン", "coins")}
              onChange={(n) => set("priceCoins", n)}
            />
            <NumberField
              label={t("納期（承諾から）", "Delivery (after acceptance)")}
              value={d.deliveryDays}
              min={1}
              max={90}
              suffix={t("日", "days")}
              onChange={(n) => set("deliveryDays", n)}
            />
            <NumberField
              label={t("納品する枚数", "Images to deliver")}
              value={d.imageCount}
              min={1}
              max={20}
              suffix={t("枚", "images")}
              onChange={(n) => set("imageCount", n)}
            />
            <NumberField
              label={t("修正の回数", "Revisions")}
              value={d.revisionCount}
              min={0}
              max={5}
              suffix={t("回", "times")}
              onChange={(n) => set("revisionCount", n)}
            />
            <NumberField
              label={t("同時に受ける数", "Max active requests")}
              value={d.maxActive}
              min={1}
              max={10}
              suffix={t("件", "requests")}
              onChange={(n) => set("maxActive", n)}
            />
          </div>
          <p className="rounded-xl bg-muted px-3 py-2 text-sm">
            {t("完了で受け取る分:", "You receive on completion:")}{" "}
            <b>
              {Number.isFinite(receive) && receive > 0
                ? formatCoins(receive, t.isEnglish)
                : "-"}
            </b>{" "}
            {t(
              "コイン相当（手数料 10% を引いた分）",
              "coins' worth (after the 10% fee)",
            )}
          </p>
          <PremiumOnlyField
            id="plan-premium-only"
            checked={d.premiumOnly}
            onChange={(v) => set("premiumOnly", v)}
          />
          <div className="flex flex-col gap-3 rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-accepting">
                {t("受付中にする", "Accept requests")}
              </Label>
              <Switch
                id="plan-accepting"
                checked={d.isAccepting}
                onCheckedChange={(v) => set("isAccepting", v)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-r18">
                {t("R18 の依頼も受ける", "Also accept R18 requests")}
                <span className="block font-normal text-muted-foreground text-xs">
                  {t(
                    "R18 の依頼はコインで受け取ります（報酬の対象外）",
                    "R18 requests are paid in coins (not eligible for rewards)",
                  )}
                </span>
              </Label>
              <Switch
                id="plan-r18"
                checked={d.allowsR18}
                onCheckedChange={(v) => set("allowsR18", v)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-hidden">
                {t("非公開にする（下書き）", "Hide (draft)")}
              </Label>
              <Switch
                id="plan-hidden"
                checked={d.status === "HIDDEN"}
                onCheckedChange={(v) => set("status", v ? "HIDDEN" : "ACTIVE")}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            {t("出品すると", "By listing, you agree to the ")}
            <Link to="/requests/terms" className="underline">
              {t("リクエスト規約", "Request terms")}
            </Link>
            {t(
              "に同意したことになります。サイトの外でのやり取り・支払いはできません。",
              ". Communication and payment outside the site are not allowed.",
            )}
          </p>
          <Button
            className="h-12 rounded-full font-bold text-base"
            disabled={saving}
            onClick={submit}
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {d.planId
              ? t("保存する", "Save")
              : d.status === "HIDDEN"
                ? t("下書きで保存", "Save as draft")
                : t("公開する", "Publish")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FreeRequestSettings(props: {
  settings: RequestSettings
  onSaved: () => void
}) {
  const t = useTranslation()
  const [s, setS] = useState(props.settings)
  const [saving, setSaving] = useState(false)
  useEffect(() => setS(props.settings), [props.settings])
  const save = async () => {
    setSaving(true)
    try {
      await requestsPost({ op: "save-settings", ...s })
      toast.success(t("保存しました", "Saved"))
      props.onSaved()
    } catch (e) {
      toast.error(requestErrorMessage(e, t.isEnglish))
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="flex flex-col gap-3 rounded-3xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">
            {t("自由リクエストを受け付ける", "Accept open requests")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t(
              "プランにない内容を、依頼する人が金額を決めて送れます。マイページに「リクエストする」ボタンが出ます。",
              'People can send requests not covered by your plans and set the price themselves. A "Request" button appears on your profile.',
            )}
          </p>
        </div>
        <Switch
          checked={s.acceptsFreeRequests}
          onCheckedChange={(v) => setS({ ...s, acceptsFreeRequests: v })}
        />
      </div>
      {s.acceptsFreeRequests && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t("最低コイン", "Minimum coins")}
              value={s.minCoins}
              min={100}
              max={100000}
              suffix={t("コイン", "coins")}
              onChange={(n) => setS({ ...s, minCoins: n })}
            />
            <NumberField
              label={t("同時に受ける数", "Max active requests")}
              value={s.maxActive}
              min={1}
              max={10}
              suffix={t("件", "requests")}
              onChange={(n) => setS({ ...s, maxActive: n })}
            />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {t(
                "依頼する人へのひとこと（受けられる内容など）",
                "A note for requesters (what you can take on, etc.)",
              )}
            </span>
            <Textarea
              value={s.note}
              rows={3}
              maxLength={500}
              onChange={(e) => setS({ ...s, note: e.target.value })}
              className="rounded-xl text-base"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <Label>{t("R18 の依頼も受ける", "Also accept R18 requests")}</Label>
            <Switch
              checked={s.allowsR18}
              onCheckedChange={(v) => setS({ ...s, allowsR18: v })}
            />
          </div>
          <PremiumOnlyField
            id="free-request-premium-only"
            checked={s.premiumOnly}
            onChange={(v) => setS({ ...s, premiumOnly: v })}
          />
        </>
      )}
      <Button
        variant="secondary"
        className="rounded-full font-bold"
        disabled={saving}
        onClick={save}
      >
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        {t("保存する", "Save")}
      </Button>
    </section>
  )
}

/**
 * 受け取るコインの条件。チェックするとプレミアムコインのみ、しなければフリーコインかプレミアムコインのどちらか
 * （1 つの依頼で 2 つを混ぜて払うことはできない）
 */
function PremiumOnlyField(props: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  const t = useTranslation()
  return (
    <div className="flex flex-col gap-2 rounded-2xl border p-3">
      <p className="font-bold text-sm">
        {t("受け取るコイン", "Coins you accept")}
      </p>
      <label
        htmlFor={props.id}
        className="flex cursor-pointer items-start gap-2"
      >
        <Checkbox
          id={props.id}
          checked={props.checked}
          onCheckedChange={(v) => props.onChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm">
          {t("プレミアムコインのみ", "Premium coins only")}
          <span className="block text-muted-foreground text-xs">
            {props.checked
              ? t(
                  "購入したプレミアムコインでの依頼だけを受け付けます。全年齢の依頼は報酬（円）になります。",
                  "Only requests paid with premium coins. All-ages requests become rewards in yen.",
                )
              : t(
                  "フリーコインかプレミアムコインのどちらか一方で支払われます（混ぜて支払うことはできません）。フリーコインの分はフリーコインで受け取ります。",
                  "Paid with either free coins or premium coins, never both. Free-coin requests are received as free coins.",
                )}
          </span>
        </span>
      </label>
    </div>
  )
}
