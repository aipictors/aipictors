import { Link } from "~/lib/app/locale-router"
import { ChevronRightIcon, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { useTranslation } from "~/hooks/use-translation"

type SupportRankingItem = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  freePtAmount: number
  premiumPtAmount: number
  transferCount: number
  isAnonymous?: boolean
  iconUrl?: string | null
  userName?: string | null
  userLogin?: string | null
}

type ApiResponse = {
  error: string | null
  data: {
    kind: "sent"
    weekStartDate: string
    items: SupportRankingItem[]
    totalCount: number
    offset: number
    limit: number
  } | null
}

const formatNumber = (value: number) => value.toLocaleString()

export function UserSupportRankingSection(props: {
  targetUserId: string
  targetUserLogin: string
  limit?: number
}) {
  const t = useTranslation()
  const limit = props.limit ?? 5
  const [items, setItems] = useState<SupportRankingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/coins/support/rankings/public?kind=sent&recipientUserId=${encodeURIComponent(props.targetUserId)}&limit=${limit}`,
          { method: "GET" },
        )
        const json = (await response.json()) as ApiResponse
        if (!response.ok || json.error || !json.data) {
          setItems([])
          return
        }
        setItems(json.data.items)
      } catch {
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [limit, props.targetUserId])

  if (!isLoading && items.length === 0) {
    return null
  }

  const toName = (row: SupportRankingItem) =>
    row.isAnonymous
      ? row.userName || t("匿名", "Anonymous")
      : row.userName || row.userLogin || t("匿名", "Anonymous")

  const toUserLink = (row: SupportRankingItem) =>
    row.isAnonymous || !row.userLogin ? null : `/users/${row.userLogin}`

  const top = items.slice(0, 3)
  const rest = items.slice(3)

  return (
    <section className="space-y-4 rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-orange-400/10 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold text-lg tracking-tight md:text-xl">
          <Trophy className="size-5 text-rose-500" />
          {t("推してくれている人", "Top supporters")}
        </h2>
        <Link
          to={`/users/${props.targetUserLogin}/supports`}
          className="flex shrink-0 items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          {t("もっと見る", "See more")}
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-background/60"
            />
          ))}
        </div>
      ) : (
        <>
          <ol className="grid grid-cols-3 gap-2 md:gap-3">
            {top.map((row) => {
              const link = toUserLink(row)
              const body = (
                <>
                  <SupportRankAvatar
                    rank={row.rank}
                    iconUrl={row.iconUrl}
                    name={toName(row)}
                    size="md"
                  />
                  <p className="mt-2 w-full truncate text-center font-bold text-sm">
                    {toName(row)}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {formatNumber(row.ptAmount)} pt
                  </p>
                </>
              )
              const className =
                "flex flex-col items-center rounded-2xl bg-background/80 px-2 py-4 shadow-sm"
              return (
                <li key={`${row.rank}-${row.userId}`}>
                  {link ? (
                    <Link
                      to={link}
                      className={`${className} hover:-translate-y-0.5 transition-transform`}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                </li>
              )
            })}
          </ol>
          {rest.length > 0 && (
            <ol className="divide-y divide-border/50 rounded-2xl bg-background/80 px-3 shadow-sm">
              {rest.map((row) => {
                const link = toUserLink(row)
                return (
                  <li
                    key={`${row.rank}-${row.userId}`}
                    className="flex items-center gap-3 py-2"
                  >
                    <SupportRankAvatar
                      rank={row.rank}
                      iconUrl={row.iconUrl}
                      name={toName(row)}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      {link ? (
                        <Link
                          to={link}
                          className="block truncate font-semibold text-sm hover:opacity-70"
                        >
                          {toName(row)}
                        </Link>
                      ) : (
                        <p className="truncate font-semibold text-sm">
                          {toName(row)}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-muted-foreground text-xs tabular-nums">
                      {formatNumber(row.ptAmount)} pt
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </section>
  )
}
