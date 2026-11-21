import type { MetaFunction } from "@remix-run/cloudflare"
import { Dices, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
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
  GACHA_ACHIEVEMENTS,
  type GachaAchievement,
  newlyUnlockedGachaAchievements,
} from "~/components/gacha/gacha-achievements"
import { GachaCoinShortageDialog } from "~/components/gacha/gacha-coin-shortage-dialog"
import {
  applyGachaPulls,
  completedGachaSets,
  emptyGachaCollection,
  exchangeGachaPrize,
  type GachaCollection,
  type GachaPullOutcome,
  ownedPrizeCount,
} from "~/components/gacha/gacha-collection"
import {
  GACHA_RARITIES,
  type GachaItem,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import {
  DEFAULT_GACHA_SETTINGS,
  drawGacha,
  type GachaSettings,
  type GachaSimulationSummary,
  type GachaState,
  simulateGacha,
  sumRates,
  toEffectiveRates,
  toPityProgress,
  urWithinPullsRatio,
} from "~/components/gacha/gacha-lottery"
import { GachaPerformance } from "~/components/gacha/gacha-performance"
import { GachaPityMeter } from "~/components/gacha/gacha-pity-meter"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { createMeta } from "~/utils/create-meta"

const TITLE = "ガチャのシミュレーション"
const DESCRIPTION =
  "確率・天井・値段を変えて、実際に引いてみたり、たくさんの人が引いたときの結果をまとめて見たりできます。ここで引いても誰にも何も付きません。"

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: TITLE,
      enTitle: "Admin Gacha Simulator",
      description: DESCRIPTION,
      enDescription: "Try gacha rates, pity and prices.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )

const RARITIES_DESC = [...GACHA_RARITIES].reverse()

/** まとめて試すときの上限（人数 × 回数）。ブラウザが固まらないように */
const MAX_SIMULATED_PULLS = 5_000_000

/** 試しに引くときの最初の残高（10 連 1 回分） */
const START_BALANCE = 3000

type Session = {
  state: GachaState
  coins: number
  /** 試しの残高（足りないときの購入を試すため） */
  balance: number
  collection: GachaCollection
  last: GachaPullOutcome[]
  /** 直前にもらったかけら */
  lastShards: number
  /** 直前に達成した実績 */
  lastAchievements: GachaAchievement[]
  /** UR が出た回数目 */
  urAt: { pull: number; name: string; byPity: boolean }[]
}

const emptySession = (): Session => ({
  state: { pullsSinceUr: 0 },
  coins: 0,
  balance: START_BALANCE,
  collection: emptyGachaCollection(),
  last: [],
  lastShards: 0,
  lastAchievements: [],
  urAt: [],
})

const toNumber = (value: string) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

/** 天井ありで、最初の UR までに引く回数の期待値 */
const expectedPullsToUr = (urRatePercent: number, pityCount: number) => {
  const q = urRatePercent / 100
  if (q <= 0) return pityCount > 0 ? pityCount : Number.POSITIVE_INFINITY
  if (pityCount <= 0) return 1 / q
  // 1 回目から k 回目まで外れる確率の和（k = 0..pity-1）
  return (1 - (1 - q) ** pityCount) / q
}

export default function AdminGachaSimulatorPage() {
  const pool = useMemo(() => GACHA_PRIZES.filter((prize) => prize.inPool), [])
  const [settings, setSettings] = useState<GachaSettings>(
    DEFAULT_GACHA_SETTINGS,
  )
  const [session, setSession] = useState<Session>(emptySession)
  const [players, setPlayers] = useState(10_000)
  const [pullsPerPlayer, setPullsPerPlayer] = useState(100)
  const [mode, setMode] = useState<"single" | "ten">("ten")
  const [summary, setSummary] = useState<GachaSimulationSummary | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  /** 引いたときに演出を見せる */
  const [withPerformance, setWithPerformance] = useState(true)
  const [performanceItems, setPerformanceItems] = useState<GachaItem[] | null>(
    null,
  )

  const rateTotal = sumRates(settings.rates)
  const isRateValid = Math.abs(rateTotal - 100) < 1e-6
  const effective = toEffectiveRates(settings.rates, pool)

  const setRate = (rarity: GachaRarity, value: string) => {
    setSettings((current) => ({
      ...current,
      rates: { ...current.rates, [rarity]: toNumber(value) },
    }))
    setSummary(null)
  }

  /** N の確率を、合計が 100 になるように合わせる */
  const fillN = () => {
    setSettings((current) => {
      const others = GACHA_RARITIES.filter((r) => r !== "N").reduce(
        (sum, rarity) => sum + current.rates[rarity],
        0,
      )
      return {
        ...current,
        rates: {
          ...current.rates,
          N: Math.max(0, Math.round((100 - others) * 1e6) / 1e6),
        },
      }
    })
    setSummary(null)
  }

  /** コインが足りなかった回（買ったらそのまま引く） */
  const [shortageCount, setShortageCount] = useState<1 | 10 | null>(null)

  const costOf = (count: number) =>
    count >= 10 ? settings.tenCostCoins : settings.singleCostCoins

  const draw = (count: 1 | 10, current: Session = session) => {
    if (!isRateValid) return
    const cost = costOf(count)
    if (current.balance < cost) {
      setShortageCount(count)
      return
    }
    const result = drawGacha({
      pool,
      settings,
      state: current.state,
      count,
      owned: new Set(
        Object.keys(current.collection.owned).filter(
          (id) => (current.collection.owned[id] ?? 0) > 0,
        ),
      ),
    })
    const applied = applyGachaPulls(current.collection, result.pulls, settings)
    const pulled = current.collection.stats.pulls
    const urAt = [...current.urAt]
    const items: GachaItem[] = applied.outcomes.map((pull, index) => {
      if (pull.prize.rarity === "UR") {
        urAt.push({
          pull: pulled + index + 1,
          name: pull.prize.name,
          byPity: pull.byPity,
        })
      }
      const notes = [
        pull.byPity ? "天井" : pull.byGuarantee ? "確定枠" : null,
        pull.shards > 0 ? `かぶり → かけら+${pull.shards}` : null,
      ].filter(Boolean)
      return {
        // 同じ景品が 2 回出てもカードを分ける
        id: `${pulled + index}-${pull.prize.id}`,
        rarity: pull.prize.rarity,
        name: pull.prize.name,
        imageUrl: pull.prize.imageUrl,
        isNew: pull.isNew,
        note: notes.length > 0 ? notes.join("・") : undefined,
      }
    })
    const achievements = newlyUnlockedGachaAchievements(
      current.collection,
      applied.collection,
      pool,
    )
    setSession({
      state: result.state,
      coins: current.coins + cost,
      balance: current.balance - cost,
      collection: applied.collection,
      last: applied.outcomes,
      lastShards: applied.gainedShards,
      lastAchievements: achievements,
      urAt,
    })
    if (withPerformance) {
      setPerformanceItems(items)
    } else {
      for (const item of achievements) {
        toast.success(`実績を達成：${item.name.ja}`)
      }
    }
  }

  /** シミュレーションなので決済はせず、買った枚数を残高に足して続けて引く */
  const purchaseForTest = (coins: number) => {
    const count = shortageCount
    const next = { ...session, balance: session.balance + coins }
    setSession(next)
    setShortageCount(null)
    toast.success(
      `シミュレーションなので決済せずに ${coins.toLocaleString()} コイン足しました（本番は決済画面へ）`,
    )
    if (count) draw(count, next)
  }

  const exchange = (prize: GachaPrize) => {
    const next = exchangeGachaPrize(session.collection, prize, settings)
    if (!next) return
    const achievements = newlyUnlockedGachaAchievements(
      session.collection,
      next,
      pool,
    )
    setSession({ ...session, collection: next })
    toast.success(`かけらで「${prize.name}」と交換しました`)
    for (const item of achievements) {
      toast.success(`実績を達成：${item.name.ja}`)
    }
  }

  const runSimulation = () => {
    if (!isRateValid) return
    setIsRunning(true)
    setSummary(null)
    // 押した表示を先に出してから重い計算をする
    window.setTimeout(() => {
      setSummary(
        simulateGacha({ pool, settings, players, pullsPerPlayer, mode }),
      )
      setIsRunning(false)
    }, 30)
  }

  const isTooHeavy = players * pullsPerPlayer > MAX_SIMULATED_PULLS
  const costPerPull =
    mode === "ten" ? settings.tenCostCoins / 10 : settings.singleCostCoins
  const expectedToUr = expectedPullsToUr(effective.UR, settings.pityCount)
  const collection = session.collection
  const ownedTypes = ownedPrizeCount(collection, pool)
  const duplicates =
    collection.stats.pulls - (ownedTypes - collection.stats.exchanges)
  const pity = toPityProgress(session.state, settings)

  return (
    <AdminGachaGate
      title={TITLE}
      description={DESCRIPTION}
      icon={Dices}
      current="/admin/gacha/simulator"
    >
      <Card className={ADMIN_GACHA_CARD}>
        <CardHeader>
          <CardTitle className="text-base">設定</CardTitle>
          <CardDescription className="text-slate-400">
            はじめは今の仮の値。ここで変えても本番には反映されません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {RARITIES_DESC.map((rarity) => (
              <div key={rarity} className="space-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <RarityBadge rarity={rarity} />
                  <span className="text-slate-400">
                    {pool.filter((p) => p.rarity === rarity).length} 種
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    aria-label={`${rarity} の確率`}
                    value={settings.rates[rarity]}
                    onChange={(event) => setRate(rarity, event.target.value)}
                    className="border-white/15 bg-white/5 text-slate-100"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={isRateValid ? "text-slate-400" : "text-red-400"}>
              合計 {Math.round(rateTotal * 1e6) / 1e6}%
              {!isRateValid && "（100% にしてください）"}
            </span>
            {!isRateValid && (
              <Button size="sm" variant="secondary" onClick={fillN}>
                N で合計を 100% に合わせる
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300"
              onClick={() => {
                setSettings(DEFAULT_GACHA_SETTINGS)
                setSummary(null)
              }}
            >
              今の仮の値に戻す
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">
                天井（UR が出ないまま何回目で確定。0 でなし）
              </span>
              <Input
                type="number"
                min={0}
                aria-label="天井"
                value={settings.pityCount}
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    pityCount: Math.floor(toNumber(event.target.value)),
                  }))
                  setSummary(null)
                }}
                className="border-white/15 bg-white/5 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">10 連の確定枠</span>
              <select
                aria-label="10 連の確定枠"
                value={settings.tenPullGuarantee ?? ""}
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    tenPullGuarantee:
                      (event.target.value as GachaRarity) || null,
                  }))
                  setSummary(null)
                }}
                className="h-10 w-full rounded-md border border-white/15 bg-slate-900 px-3 text-slate-100 text-sm"
              >
                <option value="">なし</option>
                <option value="R">R 以上</option>
                <option value="SR">SR 以上</option>
                <option value="SSR">SSR 以上</option>
              </select>
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">1 回の値段（コイン）</span>
              <Input
                type="number"
                min={0}
                aria-label="1 回の値段"
                value={settings.singleCostCoins}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    singleCostCoins: toNumber(event.target.value),
                  }))
                }
                className="border-white/15 bg-white/5 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">10 連の値段（コイン）</span>
              <Input
                type="number"
                min={0}
                aria-label="10 連の値段"
                value={settings.tenCostCoins}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    tenCostCoins: toNumber(event.target.value),
                  }))
                }
                className="border-white/15 bg-white/5 text-slate-100"
              />
            </div>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">
                最初の UR までの回数（平均）
              </div>
              <div>
                {Number.isFinite(expectedToUr)
                  ? `${expectedToUr.toFixed(1)} 回（${Math.round(expectedToUr * costPerPull).toLocaleString()} コイン）`
                  : "出ない"}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">
                天井の前に UR が出る人
              </div>
              <div>
                {settings.pityCount > 0
                  ? `${formatPercent(urWithinPullsRatio(effective.UR, settings.pityCount - 1) * 100)}`
                  : "-"}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">天井までのコイン</div>
              <div>
                {settings.pityCount > 0
                  ? `${Math.round(settings.pityCount * costPerPull).toLocaleString()} コイン`
                  : "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={ADMIN_GACHA_CARD}>
        <CardHeader>
          <CardTitle className="text-base">引いてみる</CardTitle>
          <CardDescription className="text-slate-400">
            ひとりの人が続けて引いたときの様子。「演出を見る」にすると、本番と同じ演出で結果が出ます。天井の数はリセットするまで続きます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button disabled={!isRateValid} onClick={() => draw(1)}>
              1 回引く
            </Button>
            <Button disabled={!isRateValid} onClick={() => draw(10)}>
              10 連
            </Button>
            <div className="flex items-center gap-2 px-2 text-slate-300 text-sm">
              <input
                id="gacha-sim-performance"
                type="checkbox"
                checked={withPerformance}
                onChange={(event) => setWithPerformance(event.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="gacha-sim-performance">演出を見る</label>
            </div>
            <Button
              variant="ghost"
              className="text-slate-300"
              onClick={() => setSession(emptySession())}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              リセット
            </Button>
          </div>
          <GachaPityMeter progress={pity} />
          <div className="grid gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-slate-400 text-xs">
                持っているコイン（試し）
              </div>
              <div className="flex items-center gap-2">
                {session.balance.toLocaleString()} コイン
                <button
                  type="button"
                  className="text-slate-400 text-xs underline"
                  onClick={() => setSession({ ...session, balance: 0 })}
                >
                  0 にする
                </button>
              </div>
            </div>
            <Stat
              label="引いた回数 / 使ったコイン"
              value={`${collection.stats.pulls} 回・${session.coins.toLocaleString()} コイン`}
            />
            <Stat
              label="集めた種類 / かぶり"
              value={`${ownedTypes} / ${pool.length} 種・かぶり ${duplicates}`}
            />
            <Stat
              label="かけら（かぶりでたまる）"
              value={`${collection.shards.toLocaleString()} 個`}
            />
          </div>
          {session.last.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {session.last.map((pull, index) => (
                <div
                  // 同じ景品が並ぶことがあるので位置もキーに入れる
                  key={`${collection.stats.pulls}-${index}`}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ${
                    pull.prize.rarity === "UR"
                      ? "bg-gradient-to-br from-pink-500/30 via-amber-400/30 to-sky-500/30"
                      : pull.prize.rarity === "SSR"
                        ? "bg-amber-400/20"
                        : "bg-white/5"
                  }`}
                >
                  <PrizeThumbnail prize={pull.prize} size="sm" />
                  <RarityBadge rarity={pull.prize.rarity} />
                  <div className="text-xs">{pull.prize.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {PRIZE_KIND_LABEL[pull.prize.kind]}
                    {pull.byPity && "・天井"}
                    {pull.byGuarantee && "・確定枠"}
                    {pull.isNew ? "・NEW" : `・かぶり→かけら+${pull.shards}`}
                  </div>
                </div>
              ))}
            </div>
          )}
          {session.urAt.length > 0 && (
            <div className="space-y-1 text-sm">
              <div className="text-slate-400 text-xs">UR が出た回</div>
              <ul className="flex flex-wrap gap-2">
                {session.urAt.map((item) => (
                  <li
                    key={item.pull}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs"
                  >
                    {item.pull} 回目 {item.name}
                    {item.byPity && "（天井）"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <ShardExchangeCard
        pool={pool}
        collection={collection}
        settings={settings}
        onExchange={exchange}
      />

      <AchievementsCard pool={pool} collection={collection} />

      <Card className={ADMIN_GACHA_CARD}>
        <CardHeader>
          <CardTitle className="text-base">まとめて試す</CardTitle>
          <CardDescription className="text-slate-400">
            たくさんの人がそれぞれ同じ回数だけ引いたときの結果。毎回ちがう乱数で引きます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">人数</span>
              <Input
                type="number"
                min={1}
                aria-label="人数"
                value={players}
                onChange={(event) =>
                  setPlayers(
                    Math.max(1, Math.floor(toNumber(event.target.value))),
                  )
                }
                className="border-white/15 bg-white/5 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">ひとりが引く回数</span>
              <Input
                type="number"
                min={1}
                aria-label="ひとりが引く回数"
                value={pullsPerPlayer}
                onChange={(event) =>
                  setPullsPerPlayer(
                    Math.max(1, Math.floor(toNumber(event.target.value))),
                  )
                }
                className="border-white/15 bg-white/5 text-slate-100"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">引き方</span>
              <select
                aria-label="引き方"
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as "single" | "ten")
                }
                className="h-10 w-full rounded-md border border-white/15 bg-slate-900 px-3 text-slate-100 text-sm"
              >
                <option value="ten">10 連</option>
                <option value="single">1 回ずつ</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={!isRateValid || isRunning || isTooHeavy}
                onClick={runSimulation}
              >
                {isRunning ? "計算中..." : "試す"}
              </Button>
            </div>
          </div>
          {isTooHeavy && (
            <div className="text-red-400 text-xs">
              人数 × 回数は {MAX_SIMULATED_PULLS.toLocaleString()}{" "}
              回までにしてください。
            </div>
          )}
          {summary && (
            <SummaryView
              summary={summary}
              poolSize={pool.length}
              costPerPull={costPerPull}
            />
          )}
        </CardContent>
      </Card>
      {/* 管理ページの枠の中だと全画面にならない（親の transform で fixed がずれる）ので body に出す */}
      {performanceItems &&
        createPortal(
          <GachaPerformance
            items={performanceItems}
            onClose={() => setPerformanceItems(null)}
            onDrawAgain={(count) => {
              setPerformanceItems(null)
              // 閉じてから次の演出を始める（演出を最初から作り直すため）
              window.setTimeout(() => draw(count), 0)
            }}
            resultExtra={<ResultExtra session={session} pity={pity} />}
          />,
          document.body,
        )}
      {shortageCount && (
        <GachaCoinShortageDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setShortageCount(null)
          }}
          balance={session.balance}
          cost={costOf(shortageCount)}
          label={shortageCount >= 10 ? "10 連" : "1 回"}
          bundleCost={settings.tenCostCoins}
          singleCost={settings.singleCostCoins}
          onDrawSingle={shortageCount >= 10 ? () => draw(1) : undefined}
          onPurchase={purchaseForTest}
        />
      )}
    </AdminGachaGate>
  )
}

/** 演出の結果の画面でボタンの上に出すもの（天井・かけら・達成した実績） */
function ResultExtra(props: {
  session: Session
  pity: ReturnType<typeof toPityProgress>
}) {
  const { session } = props
  return (
    <div className="space-y-1.5">
      {session.lastAchievements.length > 0 && (
        <p className="mx-auto w-fit max-w-full truncate rounded-full bg-gradient-to-r from-amber-300 to-pink-400 px-3 py-1 font-black text-slate-900 text-xs shadow-lg">
          🏅 実績を達成：
          {session.lastAchievements.map((item) => item.name.ja).join("・")}
        </p>
      )}
      {session.lastShards > 0 && (
        <p className="text-center font-bold text-sky-200 text-xs">
          かぶりはかけらになりました +{session.lastShards}（いま
          {session.collection.shards.toLocaleString()}
          。好きな景品と交換できます）
        </p>
      )}
      <GachaPityMeter progress={props.pity} compact />
    </div>
  )
}

/** かけらで、まだ持っていない景品と交換する */
function ShardExchangeCard(props: {
  pool: readonly GachaPrize[]
  collection: GachaCollection
  settings: GachaSettings
  onExchange: (prize: GachaPrize) => void
}) {
  const [rarity, setRarity] = useState<GachaRarity>("SR")
  const missing = props.pool.filter(
    (prize) =>
      prize.rarity === rarity && (props.collection.owned[prize.id] ?? 0) === 0,
  )
  const cost = props.settings.exchangeShards[rarity]
  return (
    <Card className={ADMIN_GACHA_CARD}>
      <CardHeader>
        <CardTitle className="text-base">
          かけら交換（いま {props.collection.shards.toLocaleString()} 個）
        </CardTitle>
        <CardDescription className="text-slate-400">
          かぶった景品はかけらになります（
          {RARITIES_DESC.map(
            (r) => `${r} ${props.settings.duplicateShards[r]}`,
          ).join("・")}
          ）。かけらで、まだ持っていない景品を 1 つ選んでもらえます（
          {RARITIES_DESC.map(
            (r) => `${r} ${props.settings.exchangeShards[r]}`,
          ).join("・")}
          ）。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {RARITIES_DESC.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRarity(r)}
              className={`rounded-full px-1 py-0.5 ${rarity === r ? "ring-2 ring-white" : "opacity-60"}`}
            >
              <RarityBadge rarity={r} />
            </button>
          ))}
        </div>
        {missing.length === 0 ? (
          <p className="text-slate-400 text-sm">
            {rarity} は全部持っています。
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {missing.map((prize) => {
              const canExchange = props.collection.shards >= cost
              return (
                <div
                  key={prize.id}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2 text-center"
                >
                  <PrizeThumbnail prize={prize} size="sm" />
                  <div className="text-xs">{prize.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {PRIZE_KIND_LABEL[prize.kind]}
                  </div>
                  <Button
                    size="sm"
                    variant={canExchange ? "default" : "secondary"}
                    disabled={!canExchange}
                    onClick={() => props.onExchange(prize)}
                    className="h-7 text-xs"
                  >
                    かけら {cost} で交換
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const TIER_LABEL = [
  "",
  "ブロンズ",
  "シルバー",
  "ゴールド",
  "プラチナ",
  "ダイヤモンド",
  "レジェンド",
]

/** ガチャの実績と、いまのひとり分の達成状況 */
function AchievementsCard(props: {
  pool: readonly GachaPrize[]
  collection: GachaCollection
}) {
  const sets = completedGachaSets(props.collection, props.pool).length
  return (
    <Card className={ADMIN_GACHA_CARD}>
      <CardHeader>
        <CardTitle className="text-base">ガチャの実績</CardTitle>
        <CardDescription className="text-slate-400">
          サイトの実績に足す予定のもの（達成すると無料コイン）。上で引いた分で判定します。隠し実績は達成するまで名前が出ません。おそろい
          {sets} 組。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {GACHA_ACHIEVEMENTS.map((item) => {
            const isUnlocked = item.isUnlocked(props.collection, props.pool)
            return (
              <li
                key={item.key}
                className={`flex items-start gap-2 rounded-xl p-2.5 text-sm ${isUnlocked ? "bg-amber-400/15" : "bg-white/5 opacity-70"}`}
              >
                <span className="text-lg">{isUnlocked ? "🏅" : "🔒"}</span>
                <span>
                  <span className="font-bold">{item.name.ja}</span>
                  <span className="ml-1.5 text-[10px] text-slate-400">
                    {TIER_LABEL[item.tier]}
                    {item.isHidden && "・隠し"}
                  </span>
                  <span className="block text-slate-400 text-xs">
                    {item.description.ja}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-slate-400 text-xs">{props.label}</div>
      <div>{props.value}</div>
    </div>
  )
}

function SummaryView(props: {
  summary: GachaSimulationSummary
  poolSize: number
  costPerPull: number
}) {
  const { summary } = props
  const totalPulls = summary.players * summary.pullsPerPlayer
  return (
    <div className="space-y-4">
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <Stat
          label="ひとりが使うコイン"
          value={`${Math.round(summary.pullsPerPlayer * props.costPerPull).toLocaleString()} コイン`}
        />
        <Stat
          label="UR が 1 つ以上出た人"
          value={formatPercent(summary.urPlayerRatio * 100)}
        />
        <Stat
          label="天井で UR になった回数（全員）"
          value={`${summary.pityHits.toLocaleString()} 回`}
        />
        <Stat
          label="最初の UR までの回数（出た人だけ）"
          value={
            summary.firstUrPulls
              ? `平均 ${summary.firstUrPulls.average.toFixed(1)} 回・真ん中 ${summary.firstUrPulls.median} 回`
              : "誰も出なかった"
          }
        />
        <Stat
          label="ひとりのかぶり・たまるかけら（平均）"
          value={`${summary.averageDuplicates.toFixed(1)} 個・かけら ${Math.round(summary.averageShards)}`}
        />
        <Stat
          label="持っていない景品（平均）/ 全部そろった人"
          value={`${summary.averageMissing.toFixed(1)} / ${props.poolSize} 種・${formatPercent(summary.completeRatio * 100)}`}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="text-slate-400 text-xs">
            <tr className="border-white/10 border-b">
              <th className="py-2 text-left font-normal">レア度</th>
              <th className="py-2 text-right font-normal">出た数（全員）</th>
              <th className="py-2 text-right font-normal">出た割合</th>
              <th className="py-2 text-right font-normal">ひとり平均</th>
            </tr>
          </thead>
          <tbody>
            {RARITIES_DESC.map((rarity) => (
              <tr key={rarity} className="border-white/5 border-b">
                <td className="py-2">
                  <RarityBadge rarity={rarity} />
                </td>
                <td className="py-2 text-right">
                  {summary.rarityCounts[rarity].toLocaleString()}
                </td>
                <td className="py-2 text-right">
                  {formatPercent(
                    (summary.rarityCounts[rarity] / totalPulls) * 100,
                  )}
                </td>
                <td className="py-2 text-right">
                  {(summary.rarityCounts[rarity] / summary.players).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
