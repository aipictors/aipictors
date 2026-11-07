import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { ScanEye } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { ratingLabel } from "~/components/work/work-auto-moderation"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "画像の自動判定",
      enTitle: "Automatic Rating Check",
      description: "画像の自動判定で区分を変えた作品・確認待ちの作品",
      enDescription: "Works changed or flagged by the automatic image check",
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
  "投稿時の画像の自動判定で、区分を厳しくした作品・一時非公開にした作品・投稿者から「判定が違う」と連絡があった作品を確認します。ここで決めた区分より、同じ作品が自動で上がることはありません。"

const TABS = [
  {
    value: "REVIEW,APPEALED",
    label: "要確認",
    description: "一時非公開・モザイクの疑い・判定違いの連絡",
  },
  { value: "APPEALED", label: "判定違いの連絡", description: "投稿者から" },
  {
    value: "APPLIED",
    label: "自動で変更",
    description: "区分を厳しくしただけ",
  },
  { value: "RESOLVED", label: "確認済み", description: "運営が決めたもの" },
] as const

const RATINGS = ["G", "R15", "R18", "R18G"] as const

const PAGE_SIZE = 30

type ImageResult = {
  url: string
  level?: string
  childRisk?: boolean
  needMosaic?: boolean
  scores?: Record<string, number>
  error?: string
}

export default function AdminAutoModerationPage() {
  const authContext = useContext(AuthContext)
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>(TABS[0].value)
  const [page, setPage] = useState(0)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const isModerator = viewerData?.viewer?.isModerator === true

  const statuses = tab.split(",")

  const { data, loading, refetch } = useQuery(autoModerationsQuery, {
    skip: !isModerator,
    variables: { offset: page * PAGE_SIZE, limit: PAGE_SIZE, statuses },
    fetchPolicy: "network-only",
  })

  const items = data?.workAutoModerations ?? []
  const count: number = data?.workAutoModerationsCount ?? 0

  const shell = (children: React.ReactNode) => (
    <AdminPageShell
      title="画像の自動判定"
      description={pageDescription}
      icon={ScanEye}
    >
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

  return shell(
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={tab === item.value ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => {
              setTab(item.value)
              setPage(0)
            }}
            title={item.description}
          >
            {item.label}
          </Button>
        ))}
        <span className="self-center text-slate-400 text-sm">{count} 件</span>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">読み込み中...</p>
      ) : items.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-slate-400 text-sm">
            該当する作品はありません。
          </CardContent>
        </Card>
      ) : (
        items.map((item: AutoModerationItem) => (
          <AutoModerationCard
            key={item.workId}
            item={item}
            onResolved={() => void refetch()}
          />
        ))
      )}

      {count > PAGE_SIZE && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            前へ
          </Button>
          <span className="text-slate-400 text-sm">
            {page + 1} / {Math.ceil(count / PAGE_SIZE)}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={(page + 1) * PAGE_SIZE >= count}
            onClick={() => setPage((p) => p + 1)}
          >
            次へ
          </Button>
        </div>
      )}
    </div>,
  )
}

type AutoModerationItem = {
  workId: string
  status: string
  previousRating: string
  detectedRating: string
  appliedRating: string
  moderatorRating: string | null
  isChildRisk: boolean
  isNeedMosaic: boolean
  isHidden: boolean
  isKeepSensitive: boolean
  appealMessage: string | null
  analyzedAt: number
  appealedAt: number | null
  reasonsJson: string | null
  work: {
    id: string
    title: string
    rating: string
    accessType: string
    smallThumbnailImageURL: string
    user: { id: string; name: string; login: string } | null
  } | null
}

function AutoModerationCard(props: {
  item: AutoModerationItem
  onResolved: () => void
}) {
  const { item } = props
  const [resolve, { loading }] = useMutation(resolveMutation)
  const [isPublish, setIsPublish] = useState(item.isHidden)
  const [keepSensitive, setKeepSensitive] = useState(true)

  const images: ImageResult[] = (() => {
    try {
      return JSON.parse(item.reasonsJson ?? "{}").images ?? []
    } catch {
      return []
    }
  })()

  const onResolve = async (rating: string) => {
    try {
      await resolve({
        variables: { workId: item.workId, rating, isPublish, keepSensitive },
      })
      toast.success(`区分を「${ratingLabel(rating)}」にしました`)
      props.onResolved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "失敗しました")
    }
  }

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex gap-3">
          {item.work && (
            <Link
              to={`/posts/${item.work.id}`}
              target="_blank"
              className="size-24 shrink-0 overflow-hidden rounded-xl bg-white/10"
            >
              <img
                src={item.work.smallThumbnailImageURL}
                alt={item.work.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </Link>
          )}
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="truncate font-bold">
              {item.work ? item.work.title : "（削除された作品）"}
              <span className="ml-2 font-normal text-slate-400">
                #{item.workId}
              </span>
            </p>
            {item.work?.user && (
              <p className="text-slate-400 text-xs">
                {item.work.user.name}（@{item.work.user.login}）
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">
                投稿者 {ratingLabel(item.previousRating)} → 判定{" "}
                {ratingLabel(item.detectedRating)}
              </Badge>
              {item.work && (
                <Badge variant="secondary">
                  今 {ratingLabel(item.work.rating)}
                </Badge>
              )}
              {item.isChildRisk && (
                <Badge className="bg-rose-600 text-white">
                  センシティブ（子どもに見える人物の際どい表現の疑い）
                  {item.status === "RESOLVED"
                    ? item.isKeepSensitive
                      ? "・ぼかしのまま"
                      : "・ぼかしを外した"
                    : "・一覧でぼかし中"}
                </Badge>
              )}
              {item.isNeedMosaic && (
                <Badge className="bg-amber-600 text-white">
                  モザイクが無い疑い
                </Badge>
              )}
              {item.isHidden && (
                <Badge className="bg-slate-600 text-white">一時非公開</Badge>
              )}
              {item.status === "APPEALED" && (
                <Badge className="bg-sky-600 text-white">判定違いの連絡</Badge>
              )}
              {item.moderatorRating && (
                <Badge variant="outline">
                  運営の区分 {ratingLabel(item.moderatorRating)}
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-xs">
              判定 {toDateTimeText(item.analyzedAt)}
              {item.appealedAt
                ? ` ・ 連絡 ${toDateTimeText(item.appealedAt)}`
                : ""}
            </p>
          </div>
        </div>

        {item.appealMessage && (
          <p className="rounded-xl bg-white/10 p-2 text-sm">
            投稿者のコメント: {item.appealMessage}
          </p>
        )}

        {images.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-400">
              画像ごとの判定（{images.length} 枚）
            </summary>
            <ul className="mt-2 space-y-1">
              {images.map((image, index) => (
                <li key={`${image.url}-${index}`} className="text-slate-300">
                  {index + 1} 枚目:{" "}
                  {image.error
                    ? `判定できず（${image.error}）`
                    : `${ratingLabel(image.level)}${image.childRisk ? " ・子どもの疑い" : ""}${image.needMosaic ? " ・モザイク無しの疑い" : ""} （${Object.entries(
                        image.scores ?? {},
                      )
                        .filter(([, value]) => value >= 0.3)
                        .map(([key, value]) => `${key} ${value.toFixed(2)}`)
                        .join(" / ")}）`}
                </li>
              ))}
            </ul>
          </details>
        )}

        {item.status !== "RESOLVED" && (
          <div className="space-y-2 border-white/10 border-t pt-3">
            <p className="text-slate-400 text-xs">区分を決める</p>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  disabled={loading}
                  variant={
                    rating === item.detectedRating ? "default" : "secondary"
                  }
                  className={cn("rounded-full")}
                  onClick={() => void onResolve(rating)}
                >
                  {ratingLabel(rating)}
                </Button>
              ))}
            </div>
            {item.isChildRisk && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={keepSensitive}
                  onChange={(event) => setKeepSensitive(event.target.checked)}
                />
                センシティブのまま一覧でぼかす（外すと普通に表示）
              </label>
            )}
            {item.isHidden && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublish}
                  onChange={(event) => setIsPublish(event.target.checked)}
                />
                公開に戻す（問題が無いとき）
              </label>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const viewerQuery = gql`
  query AdminAutoModerationViewer {
    viewer {
      id
      isModerator
    }
  }
`

const autoModerationsQuery = gql`
  query AdminWorkAutoModerations(
    $offset: Int!
    $limit: Int!
    $statuses: [String!]
  ) {
    workAutoModerations(offset: $offset, limit: $limit, statuses: $statuses) {
      workId
      status
      previousRating
      detectedRating
      appliedRating
      moderatorRating
      isChildRisk
      isNeedMosaic
      isHidden
      isKeepSensitive
      appealMessage
      analyzedAt
      appealedAt
      reasonsJson
      work {
        id
        title
        rating
        accessType
        smallThumbnailImageURL
        user {
          id
          name
          login
        }
      }
    }
    workAutoModerationsCount(statuses: $statuses)
  }
`

const resolveMutation = gql`
  mutation ResolveWorkAutoModeration(
    $workId: ID!
    $rating: String!
    $isPublish: Boolean
    $keepSensitive: Boolean
  ) {
    resolveWorkAutoModeration(
      workId: $workId
      rating: $rating
      isPublish: $isPublish
      keepSensitive: $keepSensitive
    )
  }
`
