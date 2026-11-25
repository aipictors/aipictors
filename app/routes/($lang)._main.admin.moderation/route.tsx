import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Gavel } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "BAN状況",
      enTitle: "Restrictions",
      description: "自動モデレーションの停止・違反・対応の記録",
      enDescription: "Automatic moderation restrictions, strikes and actions",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

const pageDescription =
  "コメントの自動判定・通報・運営の判断で数えた違反と、それによるコメント・投稿の停止（BAN）を確認・解除します。違反は 90 日で失効し、取り消すと届かなくなった自動の停止も解除されます。"

type UserRef = { id: string; name: string | null; login: string | null } | null

type Restriction = {
  id: string
  userId: string
  user: UserRef
  kind: string
  startsAt: number
  endsAt: number | null
  reason: string
  source: string
  strikeCount: number | null
  createdAt: number
  liftedAt: number | null
  isActive: boolean
}

type Strike = {
  id: string
  kind: string
  category: string
  categoryLabel: string
  weight: number
  targetType: string
  targetId: string
  source: string
  reason: string | null
  createdAt: number
  expiresAt: number
  revokedAt: number | null
  isActive: boolean
}

type Action = {
  id: string
  targetType: string
  targetId: string
  userId: string | null
  user: UserRef
  action: string
  categoryLabel: string | null
  source: string
  detail: string | null
  createdAt: number
}

const KIND_LABEL: Record<string, string> = {
  COMMENT: "コメント",
  POST: "投稿",
}

const SOURCE_LABEL: Record<string, string> = {
  AUTO: "自動",
  AUTO_RULE: "ルール",
  AUTO_AI: "AI",
  REPORTS: "通報",
  MODERATOR: "運営",
}

const ACTION_LABEL: Record<string, string> = {
  HIDE: "コメントを非表示",
  UNHIDE: "コメントを再表示",
  HIDE_WORK: "作品を非公開",
  FLAG: "要確認",
  STRIKE: "違反に数えた",
  STRIKE_REVOKED: "違反を取り消し",
  RESTRICT: "停止",
  LIFT: "停止を解除",
}

const TABS = [
  { value: "restrictions", label: "停止中" },
  { value: "actions", label: "対応の記録" },
  { value: "user", label: "ユーザーで調べる" },
  { value: "policy", label: "基準" },
] as const

const PAGE_SIZE = 50

/** UNIX 秒 → 日本時間の「2026/11/25 13:40」（toDateTimeText はフックを使うので一覧の中で呼べない） */
const toDateTimeText = (time: number) => {
  const date = new Date(time * 1000 + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

const untilText = (endsAt: number | null) =>
  endsAt === null ? "運営が解除するまで" : `${toDateTimeText(endsAt)} まで`

function UserLink(props: { user: UserRef; userId: string | null }) {
  if (props.userId === null) return <span className="text-slate-500">-</span>
  const label = props.user?.name ?? `ID ${props.userId}`
  return (
    <Link
      to={`/users/${props.user?.login ?? props.userId}`}
      className="font-medium text-sky-300 hover:underline"
      target="_blank"
    >
      {label}
    </Link>
  )
}

function targetLink(targetType: string, targetId: string) {
  if (targetType === "WORK") return `/posts/${targetId}`
  if (targetType === "USER") return `/users/${targetId}`
  return null
}

export default function AdminModerationPage() {
  const authContext = useContext(AuthContext)
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("restrictions")

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const isModerator = viewerData?.viewer?.isModerator === true

  const { data: overviewData, refetch: refetchOverview } = useQuery(
    overviewQuery,
    { skip: !isModerator, fetchPolicy: "network-only" },
  )
  const overview = overviewData?.adminModerationOverview

  const shell = (children: React.ReactNode) => (
    <AdminPageShell title="BAN状況" description={pageDescription} icon={Gavel}>
      {children}
    </AdminPageShell>
  )

  if (authContext.isLoading || viewerLoading) {
    return shell(<p className="text-slate-400 text-sm">読み込み中...</p>)
  }

  if (!isModerator) {
    return shell(
      <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
        <AlertDescription className="text-slate-300">
          このページにアクセスする権限がありません。
        </AlertDescription>
      </Alert>,
    )
  }

  const stat = (action: string, source?: string) =>
    (overview?.actionStats ?? [])
      .filter(
        (row: { action: string; source: string }) =>
          row.action === action &&
          (source === undefined || row.source === source),
      )
      .reduce(
        (
          sum: { day: number; week: number },
          row: { last24h: number; last7d: number },
        ) => ({
          day: sum.day + row.last24h,
          week: sum.week + row.last7d,
        }),
        { day: 0, week: 0 },
      )

  const hidden = stat("HIDE")
  const hiddenAi = stat("HIDE", "AUTO_AI")
  const hiddenRule = stat("HIDE", "AUTO_RULE")
  const hiddenReports = stat("HIDE", "REPORTS")
  const hiddenWorks = stat("HIDE_WORK")
  const restricted = stat("RESTRICT")

  return shell(
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="コメントの停止中"
          value={overview?.activeCommentRestrictions ?? "-"}
        />
        <StatCard
          label="投稿の停止中"
          value={overview?.activePostRestrictions ?? "-"}
        />
        <StatCard
          label="違反のある人（90日）"
          value={overview?.usersWithActiveStrikes ?? "-"}
        />
        <StatCard
          label="停止した数（24時間 / 7日）"
          value={`${restricted.day} / ${restricted.week}`}
        />
        <StatCard
          label="非表示にしたコメント（24時間 / 7日）"
          value={`${hidden.day} / ${hidden.week}`}
          detail={`ルール ${hiddenRule.week}・AI ${hiddenAi.week}・通報 ${hiddenReports.week}（7日）`}
        />
        <StatCard
          label="非公開にした作品（24時間 / 7日）"
          value={`${hiddenWorks.day} / ${hiddenWorks.week}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={tab === item.value ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "restrictions" && (
        <RestrictionsTab onChanged={() => void refetchOverview()} />
      )}
      {tab === "actions" && <ActionsTab userId={null} />}
      {tab === "user" && <UserTab onChanged={() => void refetchOverview()} />}
      {tab === "policy" && (
        <PolicyTab
          policy={overview?.policy ?? []}
          strikeTtlDays={overview?.strikeTtlDays ?? 90}
        />
      )}
    </div>,
  )
}

function StatCard(props: {
  label: string
  value: number | string
  detail?: string
}) {
  return (
    <Card className="rounded-[20px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardContent className="space-y-1 p-4">
        <p className="text-slate-400 text-xs">{props.label}</p>
        <p className="font-semibold text-xl">{props.value}</p>
        {props.detail && (
          <p className="text-slate-500 text-xs">{props.detail}</p>
        )}
      </CardContent>
    </Card>
  )
}

function RestrictionsTab(props: { onChanged: () => void }) {
  const [onlyActive, setOnlyActive] = useState(true)
  const [page, setPage] = useState(0)
  const { data, loading, refetch } = useQuery(restrictionsQuery, {
    variables: { onlyActive, offset: page * PAGE_SIZE, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
  })
  const items: Restriction[] = data?.adminModerationRestrictions ?? []

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={onlyActive ? "default" : "secondary"}
          onClick={() => {
            setOnlyActive(true)
            setPage(0)
          }}
        >
          今かかっているもの
        </Button>
        <Button
          size="sm"
          variant={onlyActive ? "secondary" : "default"}
          onClick={() => {
            setOnlyActive(false)
            setPage(0)
          }}
        >
          すべて（解除・期限切れを含む）
        </Button>
      </div>
      {loading ? (
        <p className="text-slate-400 text-sm">読み込み中...</p>
      ) : items.length === 0 ? (
        <EmptyCard text="停止はありません。" />
      ) : (
        items.map((item) => (
          <RestrictionCard
            key={item.id}
            item={item}
            onChanged={() => {
              void refetch()
              props.onChanged()
            }}
          />
        ))
      )}
      <Pager
        page={page}
        setPage={setPage}
        hasNext={items.length === PAGE_SIZE}
      />
    </div>
  )
}

function RestrictionCard(props: {
  item: Restriction
  showUser?: boolean
  onChanged: () => void
}) {
  const { item } = props
  const [lift, { loading }] = useMutation(liftMutation)

  return (
    <Card className="rounded-[20px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {props.showUser !== false && (
              <UserLink user={item.user} userId={item.userId} />
            )}
            <Badge variant="destructive">
              {KIND_LABEL[item.kind] ?? item.kind}を停止
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-slate-200">
              {SOURCE_LABEL[item.source] ?? item.source}
            </Badge>
            {!item.isActive && (
              <Badge variant="outline" className="text-slate-400">
                {item.liftedAt ? "解除済み" : "期限切れ"}
              </Badge>
            )}
          </div>
          <p className="text-slate-300 text-sm">
            {toDateTimeText(item.startsAt)} から {untilText(item.endsAt)}
            {item.liftedAt ? `（${toDateTimeText(item.liftedAt)} に解除）` : ""}
          </p>
          <p className="text-slate-400 text-sm">理由: {item.reason}</p>
        </div>
        {item.isActive && (
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={async () => {
              if (!window.confirm("この停止を解除しますか？")) return
              try {
                await lift({ variables: { id: item.id } })
                toast("解除しました")
                props.onChanged()
              } catch (error) {
                toast(
                  error instanceof Error
                    ? error.message
                    : "解除できませんでした",
                )
              }
            }}
          >
            解除する
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ActionsTab(props: { userId: string | null }) {
  const [page, setPage] = useState(0)
  const { data, loading } = useQuery(actionsQuery, {
    variables: {
      userId: props.userId,
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    },
    fetchPolicy: "network-only",
  })
  const items: Action[] = data?.adminModerationActions ?? []

  if (loading) return <p className="text-slate-400 text-sm">読み込み中...</p>
  if (items.length === 0) return <EmptyCard text="記録はありません。" />

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const href = targetLink(item.targetType, item.targetId)
        return (
          <div
            key={item.id}
            className="flex flex-wrap items-start gap-x-3 gap-y-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <span className="w-32 shrink-0 text-slate-500">
              {toDateTimeText(item.createdAt)}
            </span>
            <Badge
              variant={
                item.action === "UNHIDE" ||
                item.action === "LIFT" ||
                item.action === "STRIKE_REVOKED"
                  ? "secondary"
                  : "destructive"
              }
            >
              {ACTION_LABEL[item.action] ?? item.action}
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-slate-200">
              {SOURCE_LABEL[item.source] ?? item.source}
            </Badge>
            {props.userId === null && (
              <UserLink user={item.user} userId={item.userId} />
            )}
            {item.categoryLabel && (
              <span className="text-slate-300">{item.categoryLabel}</span>
            )}
            <span className="min-w-0 flex-1 break-all text-slate-400">
              {item.targetType === "COMMENT"
                ? `コメント ${item.targetId}`
                : null}
              {href !== null && item.targetType === "WORK" && (
                <Link
                  to={href}
                  target="_blank"
                  className="text-sky-300 hover:underline"
                >
                  作品 {item.targetId}
                </Link>
              )}
              {item.detail ? ` ${item.detail}` : ""}
            </span>
          </div>
        )
      })}
      <Pager
        page={page}
        setPage={setPage}
        hasNext={items.length === PAGE_SIZE}
      />
    </div>
  )
}

function UserTab(props: { onChanged: () => void }) {
  const [input, setInput] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const { refetch: lookup } = useQuery(userByLoginQuery, { skip: true })

  const search = async () => {
    const value = input.trim()
    setLookupError(null)
    if (value === "") return
    if (/^\d+$/.test(value)) {
      setUserId(value)
      return
    }
    const result = await lookup({
      where: { search: value.replace(/^@/, "") },
      limit: 1,
    })
    const found = result.data?.users?.[0]
    if (found) {
      setUserId(found.id)
    } else {
      setLookupError("ユーザーが見つかりませんでした")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="ユーザー ID か ログイン名"
          className="max-w-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") void search()
          }}
        />
        <Button onClick={() => void search()}>調べる</Button>
      </div>
      {lookupError && <p className="text-red-400 text-sm">{lookupError}</p>}
      {userId !== null && (
        <UserModerationDetail userId={userId} onChanged={props.onChanged} />
      )}
    </div>
  )
}

function UserModerationDetail(props: {
  userId: string
  onChanged: () => void
}) {
  const { data, loading, refetch } = useQuery(userModerationQuery, {
    variables: { userId: props.userId },
    fetchPolicy: "network-only",
  })
  const [revoke, { loading: revoking }] = useMutation(revokeMutation)
  const [restrict, { loading: restricting }] = useMutation(restrictMutation)
  const [kind, setKind] = useState<"COMMENT" | "POST">("COMMENT")
  const [days, setDays] = useState("7")
  const [reason, setReason] = useState("")

  if (loading) return <p className="text-slate-400 text-sm">読み込み中...</p>
  const status = data?.adminUserModeration
  if (!status) return <EmptyCard text="読み込めませんでした。" />

  const changed = () => {
    void refetch()
    props.onChanged()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="コメントの違反（有効）"
          value={`${status.commentStrikeCount} 回`}
        />
        <StatCard
          label="投稿の違反（有効）"
          value={`${status.postStrikeCount} 回`}
        />
        <StatCard
          label="コメント"
          value={
            status.commentRestriction
              ? untilText(status.commentRestriction.endsAt)
              : "停止なし"
          }
        />
        <StatCard
          label="投稿"
          value={
            status.postRestriction
              ? untilText(status.postRestriction.endsAt)
              : "停止なし"
          }
        />
      </div>

      <section className="space-y-2">
        <h3 className="font-semibold text-slate-200 text-sm">停止の履歴</h3>
        {status.restrictions.length === 0 ? (
          <EmptyCard text="停止はありません。" />
        ) : (
          status.restrictions.map((item: Restriction) => (
            <RestrictionCard
              key={item.id}
              item={item}
              showUser={false}
              onChanged={changed}
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-slate-200 text-sm">違反の履歴</h3>
        {status.strikes.length === 0 ? (
          <EmptyCard text="違反はありません。" />
        ) : (
          status.strikes.map((strike: Strike) => {
            const href = targetLink(strike.targetType, strike.targetId)
            return (
              <div
                key={strike.id}
                className={cn(
                  "flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm",
                  !strike.isActive && "opacity-50",
                )}
              >
                <span className="text-slate-500">
                  {toDateTimeText(strike.createdAt)}
                </span>
                <Badge variant={strike.isActive ? "destructive" : "outline"}>
                  {KIND_LABEL[strike.kind] ?? strike.kind}・
                  {strike.categoryLabel}
                  {strike.weight > 1 ? `（${strike.weight}回分）` : ""}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/10 text-slate-200"
                >
                  {SOURCE_LABEL[strike.source] ?? strike.source}
                </Badge>
                <span className="min-w-0 flex-1 text-slate-400">
                  {href ? (
                    <Link
                      to={href}
                      target="_blank"
                      className="text-sky-300 hover:underline"
                    >
                      作品 {strike.targetId}
                    </Link>
                  ) : (
                    `コメント ${strike.targetId}`
                  )}
                  {strike.reason ? ` ${strike.reason}` : ""}
                  {strike.revokedAt
                    ? `（${toDateTimeText(strike.revokedAt)} に取り消し）`
                    : strike.isActive
                      ? `（${toDateTimeText(strike.expiresAt)} に失効）`
                      : "（失効）"}
                </span>
                {strike.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revoking}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "この違反を取り消しますか？（届かなくなった自動の停止も解除されます）",
                        )
                      )
                        return
                      try {
                        await revoke({ variables: { id: strike.id } })
                        toast("取り消しました")
                        changed()
                      } catch (error) {
                        toast(
                          error instanceof Error
                            ? error.message
                            : "取り消せませんでした",
                        )
                      }
                    }}
                  >
                    取り消す
                  </Button>
                )}
              </div>
            )
          })
        )}
      </section>

      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-semibold text-slate-200 text-sm">手動で停止する</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={kind === "COMMENT" ? "default" : "secondary"}
            onClick={() => setKind("COMMENT")}
          >
            コメント
          </Button>
          <Button
            size="sm"
            variant={kind === "POST" ? "default" : "secondary"}
            onClick={() => setKind("POST")}
          >
            投稿
          </Button>
          <Input
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="w-24"
            placeholder="日数"
            inputMode="numeric"
          />
          <span className="text-slate-400 text-sm">
            日（空欄は解除するまで）
          </span>
        </div>
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="理由（本人に表示されます）"
        />
        <Button
          size="sm"
          variant="destructive"
          disabled={restricting || reason.trim() === ""}
          onClick={async () => {
            const parsed = days.trim() === "" ? null : Number.parseInt(days, 10)
            if (parsed !== null && (!Number.isFinite(parsed) || parsed < 1)) {
              toast("日数は 1 以上の数か空欄にしてください")
              return
            }
            try {
              await restrict({
                variables: {
                  userId: props.userId,
                  kind,
                  days: parsed,
                  reason: reason.trim(),
                },
              })
              toast("停止しました")
              setReason("")
              changed()
            } catch (error) {
              toast(
                error instanceof Error ? error.message : "停止できませんでした",
              )
            }
          }}
        >
          停止する
        </Button>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-slate-200 text-sm">対応の記録</h3>
        <ActionsTab userId={props.userId} />
      </section>
    </div>
  )
}

function PolicyTab(props: {
  policy: { kind: string; strikeCount: number; label: string }[]
  strikeTtlDays: number
}) {
  return (
    <div className="space-y-4 text-slate-300 text-sm">
      <Card className="rounded-[20px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardContent className="space-y-3 p-4">
          <h3 className="font-semibold">違反の回数と停止の長さ</h3>
          <p className="text-slate-400">
            違反は {props.strikeTtlDays}{" "}
            日で失効します。脅迫・差別・個人情報の晒し・児童の性的な表現は 2
            回分として数えます。止めるのはその機能だけで、閲覧・いいね・生成は止めません。
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {(["COMMENT", "POST"] as const).map((kind) => (
              <div key={kind}>
                <p className="mb-1 font-medium">{KIND_LABEL[kind]}</p>
                <table className="w-full text-left">
                  <tbody>
                    {props.policy
                      .filter((step) => step.kind === kind)
                      .map((step) => (
                        <tr
                          key={step.strikeCount}
                          className="border-white/10 border-t"
                        >
                          <td className="py-1 pr-4 text-slate-400">
                            {step.strikeCount} 回目
                          </td>
                          <td className="py-1">{step.label}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[20px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardContent className="space-y-2 p-4">
          <h3 className="font-semibold">自動で隠す・非公開にする基準</h3>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              コメント（すべて）:
              ルールで判定（費用なし）。宣伝の言葉＋リンク、登録 3
              日未満の外部への招待リンク、リンク付きの同じ文の連投は、すぐ非表示にして違反に数えます。
            </li>
            <li>
              コメント（強い言葉・リンク・電話番号・連投があるもの）: AI
              で判定。確からしさ 85% 以上なら非表示にして違反に数え、60%
              以上なら非表示だけにします（運営が確認）。
            </li>
            <li>
              コメントの通報: まだ AI で見ていなければ AI で判定。別々の人の通報
              3 人分（登録 3 日以上）、または作品の投稿者の通報 1
              件で、運営が確認するまで非表示にします（違反には数えません）。
            </li>
            <li>
              スパムを 24 時間に 5
              件自動で非表示にした人は、回数に関係なくコメントを 7
              日止めます（ボット対策）。
            </li>
            <li>
              作品の通報: 「宣伝・スパム」は AI
              で題名・説明・タグを確かめ、スパムなら一時非公開にして投稿の違反に数えます。「児童の性的な表現・違法な内容」は
              7 日以内に 3 人、理由を問わず 5
              人の通報で一時非公開にします（運営の確認待ち。違反には数えません）。
            </li>
            <li>
              運営がコメントを却下した・理由を書いて作品を非公開にしたときは違反に数えます。承認・差し戻しでそのコメントの違反は取り消されます。
            </li>
            <li>
              非表示のコメントは本人と運営には見え、本人は異議申し立てができます。AI
              の判定は 1 日 400 回までです（費用の上限）。
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyCard(props: { text: string }) {
  return (
    <Card className="rounded-[20px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardContent className="py-6 text-slate-400 text-sm">
        {props.text}
      </CardContent>
    </Card>
  )
}

function Pager(props: {
  page: number
  setPage: (page: number) => void
  hasNext: boolean
}) {
  if (props.page === 0 && !props.hasNext) return null
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={props.page === 0}
        onClick={() => props.setPage(props.page - 1)}
      >
        前へ
      </Button>
      <span className="text-slate-400 text-sm">{props.page + 1} ページ</span>
      <Button
        size="sm"
        variant="secondary"
        disabled={!props.hasNext}
        onClick={() => props.setPage(props.page + 1)}
      >
        次へ
      </Button>
    </div>
  )
}

const viewerQuery = gql`
  query AdminModerationViewer {
    viewer {
      id
      isModerator
    }
  }
`

const overviewQuery = gql`
  query AdminModerationOverview {
    adminModerationOverview {
      activeCommentRestrictions
      activePostRestrictions
      usersWithActiveStrikes
      strikeTtlDays
      actionStats {
        action
        source
        last24h
        last7d
      }
      policy {
        kind
        strikeCount
        label
      }
    }
  }
`

const restrictionFields = `
  id
  userId
  user {
    id
    name
    login
  }
  kind
  startsAt
  endsAt
  reason
  source
  strikeCount
  createdAt
  liftedAt
  isActive
`

const restrictionsQuery = gql`
  query AdminModerationRestrictions($onlyActive: Boolean, $offset: Int, $limit: Int) {
    adminModerationRestrictions(onlyActive: $onlyActive, offset: $offset, limit: $limit) {
      ${restrictionFields}
    }
  }
`

const actionsQuery = gql`
  query AdminModerationActions($userId: ID, $offset: Int, $limit: Int) {
    adminModerationActions(userId: $userId, offset: $offset, limit: $limit) {
      id
      targetType
      targetId
      userId
      user {
        id
        name
        login
      }
      action
      categoryLabel
      source
      detail
      createdAt
    }
  }
`

const userModerationQuery = gql`
  query AdminUserModeration($userId: ID!) {
    adminUserModeration(userId: $userId) {
      userId
      commentStrikeCount
      postStrikeCount
      commentRestriction {
        id
        endsAt
      }
      postRestriction {
        id
        endsAt
      }
      restrictions {
        ${restrictionFields}
      }
      strikes {
        id
        kind
        category
        categoryLabel
        weight
        targetType
        targetId
        source
        reason
        createdAt
        expiresAt
        revokedAt
        isActive
      }
    }
  }
`

const userByLoginQuery = gql`
  query AdminModerationUserByLogin($where: UsersWhereInput!, $limit: Int!) {
    users(offset: 0, limit: $limit, where: $where) {
      id
      login
      name
    }
  }
`

const liftMutation = gql`
  mutation LiftModerationRestriction($id: ID!) {
    liftModerationRestriction(id: $id)
  }
`

const revokeMutation = gql`
  mutation RevokeModerationStrike($id: ID!) {
    revokeModerationStrike(id: $id)
  }
`

const restrictMutation = gql`
  mutation RestrictUserByModerator($userId: ID!, $kind: String!, $days: Int, $reason: String!) {
    restrictUserByModerator(userId: $userId, kind: $kind, days: $days, reason: $reason)
  }
`
