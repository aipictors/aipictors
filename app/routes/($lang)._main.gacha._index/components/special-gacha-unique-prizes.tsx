import { useQuery } from "@apollo/client/index"
import { RarityBadge } from "~/components/gacha/admin-gacha-parts"
import { GACHA_PRIZES } from "~/components/gacha/gacha-prizes"
import {
  formatGachaRate,
  GACHA_RATES,
  GACHA_UNIQUE_PRIZES,
} from "~/components/gacha/gacha-rules"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { gachaUniquePrizesQuery } from "~/routes/($lang)._main.gacha._index/components/special-gacha-queries"
import { toUserAvatarDecorationAnimatedUrl } from "~/utils/user-avatar-frame"

const STYLE = `
@keyframes special-gacha-uur-sheen { 0% { background-position: 0% 50% } 100% { background-position: 200% 50% } }
@keyframes special-gacha-uur-glow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(255,236,170,.55)) } 50% { filter: drop-shadow(0 0 20px rgba(255,255,255,.95)) } }
`

const formatClaimedAt = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })

/**
 * UUR（世界で 1 人だけが持てる枠）の 5 枠と、獲得した人。
 * 獲得した人はアイコンを枠に入れて見せ、名前からプロフィールへ。退会した人は名前を出さない
 */
export function SpecialGachaUniquePrizes() {
  const { data } = useQuery(gachaUniquePrizesQuery, {
    fetchPolicy: "cache-and-network",
  })
  const list =
    data?.gachaUniquePrizes ??
    GACHA_UNIQUE_PRIZES.map((prize) => ({
      prizeId: prize.id,
      slug: prize.slug,
      name: prize.name,
      imageUrl: prize.imageUrl,
      isClaimed: false,
      claimedAt: null,
      isOwnerWithdrawn: false,
      owner: null,
    }))
  const remaining = list.filter((item) => !item.isClaimed).length
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#07060d] p-4 text-white sm:p-6">
      <style>{STYLE}</style>
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl p-px opacity-80"
        style={{
          background:
            "linear-gradient(110deg, #f8e7a8, #ffffff, #a5f3fc, #f0abfc, #f8e7a8)",
          backgroundSize: "200% 100%",
          animation: "special-gacha-uur-sheen 6s linear infinite",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 font-black text-lg">
          <RarityBadge rarity="UUR" />
          世界でひとりだけの枠
        </h2>
        <span className="text-white/70 text-xs">
          残り {remaining} / {list.length}・1 回あたり合計{" "}
          {formatGachaRate(remaining > 0 ? GACHA_RATES.UUR : 0)}
        </span>
      </div>
      <p className="mt-1 text-white/70 text-xs leading-relaxed">
        最初に当てた 1
        人だけが持てる枠です。当たった枠はガチャから抜け、残りの枠で同じ割合を分けます。交換
        pt・かけらでは交換できません。
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {list.map((item) => {
          const description =
            GACHA_PRIZES.find((prize) => prize.id === item.prizeId)
              ?.description ?? ""
          return (
            <li
              key={item.prizeId}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center",
                item.isClaimed ? "bg-white/5" : "bg-white/[.03]",
              )}
            >
              <div className="relative size-28 sm:size-32">
                {item.owner?.iconUrl ? (
                  <img
                    src={item.owner.iconUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-[17%] size-[66%] rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "absolute inset-[17%] rounded-full",
                      item.isClaimed
                        ? "bg-gradient-to-br from-slate-500 to-slate-700"
                        : "bg-gradient-to-br from-slate-800 via-slate-900 to-black",
                    )}
                  />
                )}
                <img
                  src={toUserAvatarDecorationAnimatedUrl(item.imageUrl)}
                  alt={item.name}
                  title={description}
                  loading="lazy"
                  className="absolute inset-0 size-full object-contain"
                  style={{
                    animation:
                      "special-gacha-uur-glow 2.8s ease-in-out infinite",
                  }}
                />
              </div>
              <span className="font-bold text-sm">{item.name}</span>
              {!item.isClaimed ? (
                <span className="text-[11px] text-white/60">
                  まだ誰も持っていない
                </span>
              ) : item.owner ? (
                <span className="text-[11px] text-white/80">
                  <Link
                    to={`/users/${item.owner.login}`}
                    className="font-bold text-amber-200 underline-offset-2 hover:underline"
                  >
                    {item.owner.name}
                  </Link>
                  {item.claimedAt && (
                    <span className="block text-white/50">
                      {formatClaimedAt(item.claimedAt)} 獲得
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[11px] text-white/60">
                  {item.isOwnerWithdrawn ? "退会したユーザー" : "獲得済み"}
                  {item.claimedAt && (
                    <span className="block text-white/50">
                      {formatClaimedAt(item.claimedAt)} 獲得
                    </span>
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
