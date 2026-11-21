import type { MetaFunction } from "@remix-run/cloudflare"
import { Gift } from "lucide-react"
import { useMemo, useState } from "react"
import {
  ADMIN_GACHA_CARD,
  AdminGachaGate,
} from "~/components/gacha/admin-gacha-gate"
import {
  formatPercent,
  PRIZE_KIND_LABEL,
  PrizeThumbnail,
  RarityBadge,
} from "~/components/gacha/admin-gacha-parts"
import {
  GACHA_RARITIES,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import {
  DEFAULT_GACHA_SETTINGS,
  toEffectiveRates,
  toPrizeRates,
} from "~/components/gacha/gacha-lottery"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { createMeta } from "~/utils/create-meta"

const TITLE = "ガチャの景品一覧"
const DESCRIPTION =
  "いまのガチャに入っている景品と、1 回引いたときの確率。レア度を決めてから、同じレア度の中で同じ確率で 1 つ選びます。"

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: TITLE,
      enTitle: "Admin Gacha Prizes",
      description: DESCRIPTION,
      enDescription: "Gacha prizes and their rates.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )

type KindFilter = "ALL" | GachaPrize["kind"]

const RARITIES_DESC = [...GACHA_RARITIES].reverse()

export default function AdminGachaPrizesPage() {
  const [kind, setKind] = useState<KindFilter>("ALL")
  const settings = DEFAULT_GACHA_SETTINGS

  const pool = useMemo(() => GACHA_PRIZES.filter((prize) => prize.inPool), [])
  const reserve = useMemo(
    () => GACHA_PRIZES.filter((prize) => !prize.inPool),
    [],
  )
  const prizeRates = useMemo(() => toPrizeRates(pool, settings.rates), [pool])
  const rarityRates = useMemo(
    () => toEffectiveRates(settings.rates, pool),
    [pool],
  )

  const countOf = (rarity: GachaRarity, target: KindFilter = "ALL") =>
    pool.filter(
      (prize) =>
        prize.rarity === rarity && (target === "ALL" || prize.kind === target),
    ).length

  const visible = (prizes: readonly GachaPrize[]) =>
    prizes.filter((prize) => kind === "ALL" || prize.kind === kind)

  return (
    <AdminGachaGate
      title={TITLE}
      description={DESCRIPTION}
      icon={Gift}
      current="/admin/gacha"
    >
      <Card className={ADMIN_GACHA_CARD}>
        <CardHeader>
          <CardTitle className="text-base">いまの設定</CardTitle>
          <CardDescription className="text-slate-400">
            まだ仮の値です（app/components/gacha/gacha-lottery.ts の
            DEFAULT_GACHA_SETTINGS）。シミュレーションのページで値を変えて試せます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">値段</div>
              <div>
                1 回 {settings.singleCostCoins.toLocaleString()} コイン / 10 連{" "}
                {settings.tenCostCoins.toLocaleString()} コイン
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">天井</div>
              <div>
                {settings.pityCount > 0
                  ? `UR が出ないまま ${settings.pityCount} 回目で UR 確定（${(settings.pityCount * settings.singleCostCoins).toLocaleString()} コイン）`
                  : "なし"}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">10 連の確定枠</div>
              <div>
                {settings.tenPullGuarantee
                  ? `1 枠は ${settings.tenPullGuarantee} 以上`
                  : "なし"}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-slate-400 text-xs">
                <tr className="border-white/10 border-b">
                  <th className="py-2 text-left font-normal">レア度</th>
                  <th className="py-2 text-right font-normal">確率</th>
                  <th className="py-2 text-right font-normal">景品の数</th>
                  <th className="py-2 text-right font-normal">
                    アイコン枠 / ヘッダー枠
                  </th>
                  <th className="py-2 text-right font-normal">1 つあたり</th>
                </tr>
              </thead>
              <tbody>
                {RARITIES_DESC.map((rarity) => (
                  <tr key={rarity} className="border-white/5 border-b">
                    <td className="py-2">
                      <RarityBadge rarity={rarity} />
                    </td>
                    <td className="py-2 text-right">
                      {formatPercent(rarityRates[rarity])}
                    </td>
                    <td className="py-2 text-right">{countOf(rarity)}</td>
                    <td className="py-2 text-right text-slate-400">
                      {countOf(rarity, "ICON_FRAME")} /{" "}
                      {countOf(rarity, "HEADER_FRAME")}
                    </td>
                    <td className="py-2 text-right">
                      {countOf(rarity) > 0
                        ? formatPercent(rarityRates[rarity] / countOf(rarity))
                        : "-"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-slate-400">合計</td>
                  <td className="py-2 text-right">100%</td>
                  <td className="py-2 text-right">{pool.length}</td>
                  <td className="py-2 text-right text-slate-400">
                    {pool.filter((p) => p.kind === "ICON_FRAME").length} /{" "}
                    {pool.filter((p) => p.kind === "HEADER_FRAME").length}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "ICON_FRAME", "HEADER_FRAME"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={
              kind === value
                ? "rounded-full bg-sky-400 px-3 py-1 text-slate-900 text-xs"
                : "rounded-full border border-white/15 px-3 py-1 text-slate-300 text-xs hover:bg-white/10"
            }
          >
            {value === "ALL" ? "すべて" : PRIZE_KIND_LABEL[value]}
          </button>
        ))}
      </div>

      {RARITIES_DESC.map((rarity) => {
        const prizes = visible(pool.filter((p) => p.rarity === rarity))
        if (prizes.length === 0) return null
        return (
          <Card key={rarity} className={ADMIN_GACHA_CARD}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <RarityBadge rarity={rarity} />
                <span>{prizes.length} 種</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrizeGrid prizes={prizes} prizeRates={prizeRates} />
            </CardContent>
          </Card>
        )
      })}

      {visible(reserve).length > 0 && (
        <Card className={ADMIN_GACHA_CARD}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              控え（作ってあるが、いまのガチャには入れていない）
            </CardTitle>
            <CardDescription className="text-slate-400">
              UR・SSR
              の数を絞るために外した枠。イベントのガチャなどで使う予定です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrizeGrid prizes={visible(reserve)} />
          </CardContent>
        </Card>
      )}
    </AdminGachaGate>
  )
}

function PrizeGrid(props: {
  prizes: readonly GachaPrize[]
  prizeRates?: Map<string, number>
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
      {props.prizes.map((prize) => (
        <div key={prize.id} className="space-y-2 rounded-xl bg-white/5 p-3">
          <div className="flex h-20 items-center justify-center">
            <PrizeThumbnail prize={prize} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <RarityBadge rarity={prize.rarity} />
              <span className="text-slate-400 text-xs">
                {PRIZE_KIND_LABEL[prize.kind]}
              </span>
            </div>
            <div className="font-medium text-sm">{prize.name}</div>
            <div className="line-clamp-2 text-slate-400 text-xs">
              {prize.description}
            </div>
            <div className="text-slate-500 text-xs">
              {prize.slug}
              {props.prizeRates && (
                <span className="ml-2 text-slate-200">
                  {formatPercent(props.prizeRates.get(prize.id) ?? 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
