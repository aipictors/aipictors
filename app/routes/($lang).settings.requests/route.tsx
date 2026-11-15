import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  Eye,
  EyeOff,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react"
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
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import {
  type CreatorRequestProfile,
  formatCoins,
  PLAN_CATEGORY_LABELS,
  REQUEST_FEE_RATE,
  type RequestPlan,
  type RequestSettings,
  requestErrorMessage,
  requestsGet,
  requestsPost,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
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
  status: plan.status === "HIDDEN" ? "HIDDEN" : "ACTIVE",
})

/** リクエストとプラン: 自分のプラン（出品メニュー）の作成・編集と、自由リクエストの受付 */
export default function SettingsRequestsPage() {
  const auth = useContext(AuthContext)
  const [profile, setProfile] = useState<CreatorRequestProfile | null>(null)
  const [draft, setDraft] = useState<PlanDraft | null>(null)

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
      toast.error(requestErrorMessage(e))
    }
  }, [auth.userId])

  useEffect(() => {
    void load()
  }, [load])

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Button asChild className="rounded-full">
          <Link to="/login">ログインして設定する</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-5 pb-24">
      <div className="block md:hidden">
        <SettingsHeader title="リクエストとプラン" />
      </div>

      <section className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-500 p-5 text-white">
        <h1 className="font-bold text-xl">
          プランを出品して、コインで依頼を受けよう
        </h1>
        <p className="text-sm text-white/90">
          作ったプランはマイページとプラン一覧に並びます。依頼が完了すると、代金から手数料
          10% を引いた分を受け取れます（全年齢の依頼で
          <Link to="/settings/creator-rewards" className="underline">
            クリエイター報酬
          </Link>
          に参加していれば、有料コインの分は報酬（円）に）。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="rounded-full font-bold"
            onClick={() => setDraft(emptyDraft())}
          >
            <Plus className="mr-1 size-4" />
            プランを作る
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full font-bold text-white hover:bg-white/15 hover:text-white"
          >
            <Link to="/requests">
              <Inbox className="mr-1 size-4" />
              依頼の管理
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full font-bold text-white hover:bg-white/15 hover:text-white"
          >
            <Link to="/requests/terms">リクエスト規約</Link>
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
                自分のプラン
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
                    マイページで見る
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
                <span className="font-bold">最初のプランを作る</span>
                <span className="text-muted-foreground text-sm">
                  例: 「アイコン 1 枚 1,000 コイン・納期 7 日・修正 1 回」
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
  const [busy, setBusy] = useState(false)
  const save = async (patch: Partial<PlanDraft>, message: string) => {
    setBusy(true)
    try {
      await requestsPost({ op: "save-plan", ...toDraft(plan), ...patch })
      toast.success(message)
      props.onChanged()
    } catch (e) {
      toast.error(requestErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (
      !window.confirm(
        `プラン「${plan.title}」を削除しますか？（進行中の依頼はそのまま続きます）`,
      )
    )
      return
    setBusy(true)
    try {
      await requestsPost({ op: "delete-plan", id: plan.id })
      toast.success("削除しました")
      props.onChanged()
    } catch (e) {
      toast.error(requestErrorMessage(e))
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
          <span>納期 {plan.deliveryDays} 日</span>
          <span>{PLAN_CATEGORY_LABELS[plan.category] ?? plan.category}</span>
          {hidden ? (
            <span>非公開</span>
          ) : plan.isAccepting ? (
            <span className="text-emerald-600">受付中</span>
          ) : (
            <span>受付停止</span>
          )}
          {plan.allowsR18 && <span className="text-rose-500">R18 可</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-full"
            disabled={busy}
            onClick={props.onEdit}
          >
            <Pencil className="mr-1 size-3.5" />
            編集
          </Button>
          <div className="flex items-center gap-1.5 px-2 text-xs">
            <Switch
              checked={plan.isAccepting}
              disabled={busy}
              onCheckedChange={(v) =>
                save(
                  { isAccepting: v },
                  v ? "受付を始めました" : "受付を止めました",
                )
              }
            />
            受付
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full"
            disabled={busy}
            onClick={() =>
              save(
                { status: hidden ? "ACTIVE" : "HIDDEN" },
                hidden ? "公開しました" : "非公開にしました",
              )
            }
          >
            {hidden ? (
              <Eye className="mr-1 size-3.5" />
            ) : (
              <EyeOff className="mr-1 size-3.5" />
            )}
            {hidden ? "公開" : "非公開"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full text-rose-500"
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
      toast.success(d.planId ? "プランを保存しました" : "プランを公開しました")
      props.onSaved()
    } catch (e) {
      toast.error(requestErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {d.planId ? "プランを編集" : "プランを作る"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">タイトル</span>
            <Input
              value={d.title}
              maxLength={60}
              placeholder="例: ゆるかわアイコン 1 枚"
              onChange={(e) => set("title", e.target.value)}
              className="rounded-xl text-base"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">カテゴリ</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PLAN_CATEGORY_LABELS).map(([value, label]) => (
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
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              説明（できること・できないこと・使い方の範囲）
            </span>
            <Textarea
              value={d.description}
              rows={6}
              maxLength={4000}
              placeholder={
                "例:\n・バストアップのアイコンを 1 枚（1024×1024）\n・背景は単色\n・SNS のアイコンに使えます（商用はご相談）\n・実在の人物、他の作品のキャラクターは受けられません"
              }
              onChange={(e) => set("description", e.target.value)}
              className="rounded-xl text-base"
            />
          </label>
          <RequestImagePicker
            value={d.sampleImageUrls}
            onChange={(urls) => set("sampleImageUrls", urls)}
            max={4}
            label="見本の画像（最大 4 枚、1 枚目がカードに出ます）"
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="価格"
              value={d.priceCoins}
              min={100}
              max={100000}
              suffix="コイン"
              onChange={(n) => set("priceCoins", n)}
            />
            <NumberField
              label="納期（承諾から）"
              value={d.deliveryDays}
              min={1}
              max={90}
              suffix="日"
              onChange={(n) => set("deliveryDays", n)}
            />
            <NumberField
              label="納品する枚数"
              value={d.imageCount}
              min={1}
              max={20}
              suffix="枚"
              onChange={(n) => set("imageCount", n)}
            />
            <NumberField
              label="修正の回数"
              value={d.revisionCount}
              min={0}
              max={5}
              suffix="回"
              onChange={(n) => set("revisionCount", n)}
            />
            <NumberField
              label="同時に受ける数"
              value={d.maxActive}
              min={1}
              max={10}
              suffix="件"
              onChange={(n) => set("maxActive", n)}
            />
          </div>
          <p className="rounded-xl bg-muted px-3 py-2 text-sm">
            完了で受け取る分:{" "}
            <b>
              {Number.isFinite(receive) && receive > 0
                ? formatCoins(receive)
                : "-"}
            </b>{" "}
            コイン相当（手数料 10% を引いた分）
          </p>
          <div className="flex flex-col gap-3 rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-accepting">受付中にする</Label>
              <Switch
                id="plan-accepting"
                checked={d.isAccepting}
                onCheckedChange={(v) => set("isAccepting", v)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-r18">
                R18 の依頼も受ける
                <span className="block font-normal text-muted-foreground text-xs">
                  R18 の依頼はコインで受け取ります（報酬の対象外）
                </span>
              </Label>
              <Switch
                id="plan-r18"
                checked={d.allowsR18}
                onCheckedChange={(v) => set("allowsR18", v)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-hidden">非公開にする（下書き）</Label>
              <Switch
                id="plan-hidden"
                checked={d.status === "HIDDEN"}
                onCheckedChange={(v) => set("status", v ? "HIDDEN" : "ACTIVE")}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            出品すると
            <Link to="/requests/terms" className="underline">
              リクエスト規約
            </Link>
            に同意したことになります。サイトの外でのやり取り・支払いはできません。
          </p>
          <Button
            className="h-12 rounded-full font-bold text-base"
            disabled={saving}
            onClick={submit}
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {d.planId
              ? "保存する"
              : d.status === "HIDDEN"
                ? "下書きで保存"
                : "公開する"}
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
  const [s, setS] = useState(props.settings)
  const [saving, setSaving] = useState(false)
  useEffect(() => setS(props.settings), [props.settings])
  const save = async () => {
    setSaving(true)
    try {
      await requestsPost({ op: "save-settings", ...s })
      toast.success("保存しました")
      props.onSaved()
    } catch (e) {
      toast.error(requestErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="flex flex-col gap-3 rounded-3xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">自由リクエストを受け付ける</h2>
          <p className="text-muted-foreground text-xs">
            プランにない内容を、依頼する人が金額を決めて送れます。マイページに「リクエストする」ボタンが出ます。
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
              label="最低コイン"
              value={s.minCoins}
              min={100}
              max={100000}
              suffix="コイン"
              onChange={(n) => setS({ ...s, minCoins: n })}
            />
            <NumberField
              label="同時に受ける数"
              value={s.maxActive}
              min={1}
              max={10}
              suffix="件"
              onChange={(n) => setS({ ...s, maxActive: n })}
            />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              依頼する人へのひとこと（受けられる内容など）
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
            <Label>R18 の依頼も受ける</Label>
            <Switch
              checked={s.allowsR18}
              onCheckedChange={(v) => setS({ ...s, allowsR18: v })}
            />
          </div>
        </>
      )}
      <Button
        variant="secondary"
        className="rounded-full font-bold"
        disabled={saving}
        onClick={save}
      >
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        保存する
      </Button>
    </section>
  )
}
