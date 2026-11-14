import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ExternalLinkIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  fetchPictorRunRanking,
  type PictorRunRanking,
  type PictorRunRankingPeriod,
} from "~/components/pictor-run/pictor-run-api"
import { PictorRunUserName } from "~/components/pictor-run/pictor-run-user"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = Readonly<{
  viewerId: string | null
  /** スコアを送るたびに変わる値（変わったら読み直す） */
  refreshKey: number
}>

const MEDALS = ["🥇", "🥈", "🥉"]

/**
 * スコアランキング（今週 / これまで）
 */
export function PictorRunRankingPanel(props: Props): React.ReactNode {
  const t = useTranslation()
  const [period, setPeriod] = useState<PictorRunRankingPeriod>("week")
  const [ranking, setRanking] = useState<PictorRunRanking | null>(null)
  const [isFailed, setIsFailed] = useState(false)
  /** 押して、下に情報を出している人 */
  const [selected, setSelected] = useState<
    PictorRunRanking["items"][number] | null
  >(null)

  // スコアを送ったとき・ログインが変わったときにも読み直す
  useEffect(() => {
    let cancelled = false
    setIsFailed(false)
    fetchPictorRunRanking(period)
      .then((data) => {
        if (!cancelled) setRanking(data)
      })
      .catch(() => {
        if (!cancelled) setIsFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [period, props.refreshKey, props.viewerId])

  const periods: { value: PictorRunRankingPeriod; label: string }[] = [
    { value: "week", label: t("今週", "This week") },
    { value: "all", label: t("これまで", "All time") },
  ]

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex gap-1 px-3 pt-2 pb-2">
        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={period === item.value}
            onClick={() => {
              setRanking(null)
              setSelected(null)
              setPeriod(item.value)
            }}
            className={cn(
              "h-9 flex-1 cursor-pointer rounded-full font-bold text-sm transition-colors",
              period === item.value
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isFailed && (
          <p className="px-2 py-6 text-center text-slate-500 text-sm">
            {t(
              "ランキングを読み込めませんでした。",
              "Could not load the ranking.",
            )}
          </p>
        )}
        {!isFailed && ranking === null && (
          <p className="px-2 py-6 text-center text-slate-400 text-sm">
            {t("よみこみ中…", "Loading…")}
          </p>
        )}
        {ranking !== null && ranking.items.length === 0 && (
          <p className="px-2 py-6 text-center text-slate-500 text-sm">
            {t(
              "まだ記録がありません。最初の 1 位になりましょう！",
              "No records yet. Be the first!",
            )}
          </p>
        )}
        <ol className="space-y-1">
          {ranking?.items.map((item) => (
            <li key={item.user.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                aria-label={t(
                  `${item.rank} 位 ${item.user.name} の情報を見る`,
                  `#${item.rank} ${item.user.name}: view details`,
                )}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-100",
                  item.user.id === props.viewerId
                    ? "bg-amber-100 hover:bg-amber-200"
                    : item.rank <= 3
                      ? "bg-slate-50"
                      : "",
                )}
              >
                <span className="w-7 shrink-0 text-center font-black text-slate-500 text-sm tabular-nums">
                  {MEDALS[item.rank - 1] ?? item.rank}
                </span>
                <img
                  src={withIconUrlFallback(item.user.iconUrl)}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="size-8 shrink-0 rounded-full bg-slate-200 object-cover"
                />
                <PictorRunUserName user={item.user} />
                <span className="ml-auto shrink-0 font-black tabular-nums">
                  {item.score.toLocaleString()}
                  <span className="ml-0.5 font-bold text-slate-500 text-xs">
                    m
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {selected && (
        <RankingUserSheet
          item={selected}
          period={period}
          onClose={() => setSelected(null)}
        />
      )}

      {ranking?.me && (
        <p className="border-t bg-amber-50 px-4 py-2 text-center font-bold text-sm">
          {t(
            `あなたは ${ranking.me.rank} 位（${ranking.me.score.toLocaleString()} m）`,
            `You are #${ranking.me.rank} (${ranking.me.score.toLocaleString()} m)`,
          )}
        </p>
      )}
      {ranking !== null && !ranking.me && props.viewerId === null && (
        <p className="border-t bg-slate-50 px-4 py-2 text-center text-slate-600 text-sm">
          <a
            href="/login"
            className="font-bold text-clear-bright-blue underline"
          >
            {t("ログイン", "Log in")}
          </a>
          {t("するとランキングに参加できます", " to join the ranking")}
        </p>
      )}
    </div>
  )
}

/**
 * ランキングの人を押したときに、下から出す情報（記録と、プロフィールのあらまし）。
 * 「プロフィールを見る」で、その人のページを別のタブで開く
 */
function RankingUserSheet(props: {
  item: PictorRunRanking["items"][number]
  period: PictorRunRankingPeriod
  onClose: () => void
}): React.ReactNode {
  const t = useTranslation()
  const { item } = props
  const { data, loading } = useQuery(rankingUserQuery, {
    variables: { id: item.user.id },
  })
  const user = data?.user ?? null
  const login = user?.login ?? item.user.login
  // 得点 = 走った距離 + コイン 1 枚につき 10
  const distance = Math.max(0, item.score - item.coins * 10)

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end">
      <button
        type="button"
        aria-label={t("とじる", "Close")}
        onClick={props.onClose}
        className="fade-in absolute inset-0 animate-in cursor-default bg-slate-900/35 duration-150"
      />
      <div className="slide-in-from-bottom-6 fade-in relative animate-in space-y-3 rounded-t-3xl bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl duration-200">
        <div className="flex items-center gap-3">
          <img
            src={withIconUrlFallback(item.user.iconUrl)}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full bg-slate-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <PictorRunUserName user={item.user} />
            {login && (
              <p className="truncate text-slate-500 text-xs">@{login}</p>
            )}
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label={t("とじる", "Close")}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100"
          >
            <XIcon aria-hidden="true" className="size-5" />
          </button>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            [
              props.period === "week"
                ? t("今週の順位", "Rank this week")
                : t("順位", "Rank"),
              t(`${item.rank} 位`, `#${item.rank}`),
            ],
            [t("記録", "Score"), `${item.score.toLocaleString()} m`],
            [
              t("距離・コイン", "Distance · coins"),
              `${distance.toLocaleString()}m・${item.coins}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-100 px-2 py-2">
              <dt className="text-[11px] text-slate-500">{label}</dt>
              <dd className="font-black text-sm tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {loading && !user && (
          <p className="h-16 text-center text-slate-400 text-sm">
            {t("よみこみ中…", "Loading…")}
          </p>
        )}
        {user && (
          <>
            <p className="flex gap-4 text-slate-600 text-xs">
              <span>
                {t("フォロワー", "Followers")}{" "}
                <b className="text-slate-900 tabular-nums">
                  {user.followersCount.toLocaleString()}
                </b>
              </span>
              <span>
                {t("もらったいいね", "Likes received")}{" "}
                <b className="text-slate-900 tabular-nums">
                  {user.receivedLikesCount.toLocaleString()}
                </b>
              </span>
            </p>
            {user.biography && (
              <p className="line-clamp-3 whitespace-pre-line break-words text-slate-700 text-sm">
                {user.biography}
              </p>
            )}
            {user.works.length > 0 && (
              <ul className="grid grid-cols-4 gap-1.5">
                {user.works.map((work) => (
                  <li key={work.id}>
                    <a
                      href={`/posts/${work.id}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={work.title}
                    >
                      <img
                        src={work.smallThumbnailImageURL}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full rounded-xl bg-slate-100 object-cover"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {login && (
          <a
            href={`/users/${login}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-clear-bright-blue font-black text-sm text-white hover:opacity-90"
          >
            <ExternalLinkIcon aria-hidden="true" className="size-4" />
            {t("プロフィールを見る", "View profile")}
          </a>
        )}
      </div>
    </div>
  )
}

const rankingUserQuery = graphql(
  `query PictorRunRankingUser($id: ID!) {
    user(id: $id) {
      id
      login
      biography
      followersCount
      receivedLikesCount
      works(offset: 0, limit: 4, where: { ratings: [G] }) {
        id
        title
        smallThumbnailImageURL
      }
    }
  }`,
)
