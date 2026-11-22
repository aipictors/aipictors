import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { CoinPrice } from "~/components/requests/request-ui"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  type OpenRequestShowcaseItem,
  openRequestsGet,
} from "~/lib/open-requests-api"

/**
 * マイページの「募集リクエストで採用」: 採用された作品のうち、依頼者が実績としての公開を許可したもの（全年齢だけ）。
 * 1 件もなければ何も出さない
 */
export function UserOpenRequestAwardsSection(props: { userId: string }) {
  const t = useTranslation()
  const [data, setData] = useState<{
    items: OpenRequestShowcaseItem[]
    counts: { awarded: number }
  } | null>(null)

  useEffect(() => {
    let alive = true
    openRequestsGet<{
      items: OpenRequestShowcaseItem[]
      counts: { awarded: number }
    }>({
      op: "showcase",
      userId: props.userId,
      limit: 12,
    })
      .then((result) => alive && setData(result))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [props.userId])

  if (!data || data.items.length === 0) return null

  return (
    <section className="mx-1 flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 font-bold text-sm">
        <Trophy className="size-4 text-amber-500" />
        {t("募集リクエストで採用", "Picked in open requests")}
        <span className="text-muted-foreground text-xs">
          {t(`${data.counts.awarded}件`, `${data.counts.awarded}`)}
        </span>
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.items.map((item) => (
          <Link
            key={item.requestId}
            to={`/requests/open/${item.requestId}`}
            className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border bg-card hover:shadow-md"
          >
            <div className="aspect-square w-full bg-muted">
              {item.imageUrls[0] && (
                <img
                  src={item.imageUrls[0]}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              <p className="line-clamp-1 font-bold text-xs">{item.title}</p>
              <CoinPrice coins={item.rewardCoins} className="text-xs" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
