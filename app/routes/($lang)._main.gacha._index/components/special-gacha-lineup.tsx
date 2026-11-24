import { RarityBadge } from "~/components/gacha/admin-gacha-parts"
import {
  formatGachaRate,
  GACHA_POOL,
  GACHA_RATES,
} from "~/components/gacha/gacha-rules"
import { toUserAvatarDecorationAnimatedUrl } from "~/utils/user-avatar-frame"

const STYLE = `
@keyframes special-gacha-glow { 0%, 100% { filter: drop-shadow(0 0 6px rgba(255,200,255,.5)) } 50% { filter: drop-shadow(0 0 16px rgba(255,220,150,.9)) } }
`

/**
 * 目玉の UR（アイコン枠は動く絵で見せる）と、レア度ごとの数・確率
 */
export function SpecialGachaLineup() {
  const urs = GACHA_POOL.filter(
    (prize) => prize.rarity === "UR" && prize.kind === "ICON_FRAME",
  )
  const counts = (["UUR", "UR", "SSR", "SR", "R", "N"] as const).map(
    (rarity) => ({
      rarity,
      count: GACHA_POOL.filter((prize) => prize.rarity === rarity).length,
    }),
  )
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6">
      <style>{STYLE}</style>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-black text-lg">目玉の UR</h2>
        <span className="text-muted-foreground text-xs">
          UR {formatGachaRate(GACHA_RATES.UR)}・全 {GACHA_POOL.length} 種
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {urs.map((prize) => (
          <div key={prize.id} className="flex flex-col items-center gap-1">
            <div className="relative size-24 sm:size-32">
              <div className="absolute inset-[17%] rounded-full bg-gradient-to-br from-pink-200 via-amber-100 to-sky-200" />
              <img
                src={toUserAvatarDecorationAnimatedUrl(prize.imageUrl)}
                alt={prize.name}
                loading="lazy"
                className="absolute inset-0 size-full object-contain"
                style={{
                  animation: "special-gacha-glow 2.6s ease-in-out infinite",
                }}
              />
            </div>
            <RarityBadge rarity="UR" />
            <span className="text-center font-bold text-xs">{prize.name}</span>
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap justify-center gap-2 text-xs">
        {counts.map((item) => (
          <li
            key={item.rarity}
            className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
          >
            <RarityBadge rarity={item.rarity} />
            {item.count} 種・{item.rarity === "UUR" ? "合計 " : ""}
            {formatGachaRate(GACHA_RATES[item.rarity])}
          </li>
        ))}
      </ul>
      <p className="text-center text-[11px] text-muted-foreground">
        UUR は取られた枠が抜け、残りの枠で合計{" "}
        {formatGachaRate(GACHA_RATES.UUR)} を分けます（全部取られたら 0% で、N
        は {formatGachaRate(GACHA_RATES.N + GACHA_RATES.UUR)}
        ）。いまの割合は提供割合のページで見られます
      </p>
    </section>
  )
}
