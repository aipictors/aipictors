import { useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { RarityBadge } from "~/components/gacha/admin-gacha-parts"
import {
  GACHA_RARITIES,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import {
  formatGachaRate,
  GACHA_DUPLICATE_SHARDS,
  GACHA_EXCHANGE_POINTS,
  GACHA_EXCHANGE_SHARDS,
  GACHA_FREE_DAILY_LIMIT,
  GACHA_POOL,
  GACHA_PRICES,
  GACHA_RATES,
  GACHA_TEN_PULL_GUARANTEE,
  GACHA_UNIQUE_FALLBACK,
  GACHA_UNIQUE_PRIZES,
  isUniqueGachaPrize,
  toGachaPool,
  toGachaPrizeRate,
  toGachaRarityRates,
} from "~/components/gacha/gacha-rules"
import { Link } from "~/lib/app/locale-router"
import { gachaRatesQuery } from "~/routes/($lang)._main.gacha._index/components/special-gacha-queries"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: "スペシャル枠ガチャの提供割合・ご注意",
      enTitle: "Special Frame Gacha Rates",
      description:
        "スペシャル枠ガチャのレア度ごと・景品ごとの提供割合（確率）、10 連の確定枠、天井（交換 pt）、料金とご注意。",
      enDescription:
        "Drop rates per rarity and per prize, the 10-pull guarantee, exchange points and notes for the special frame gacha.",
    },
    undefined,
    props.params.lang,
  )

const RARITIES_DESC = [...GACHA_RARITIES].reverse()

/** かけらの説明に出すレア度（UUR はかぶらず、交換もできない） */
const SHARD_RARITIES = RARITIES_DESC.filter((rarity) => rarity !== "UUR")

/**
 * 提供割合（確率）とご注意。
 * UUR は取られた枠が抜けるので、いまの割合はサーバー（gachaRates）から読む。読めるまでは「UUR が全部残っている」ときの値を出す。
 * 景品ごとの割合は、サーバーの「取られた UUR」から gacha-rules.ts で計算する（サーバーと同じ計算）
 */
export default function GachaRatesRoute() {
  const { data } = useQuery(gachaRatesQuery, {
    fetchPolicy: "cache-and-network",
  })
  const takenIds = (data?.gachaUniquePrizes ?? [])
    .filter((item) => item.isClaimed)
    .map((item) => item.prizeId)
  const pool = toGachaPool(takenIds)
  const local = {
    normal: toGachaRarityRates("N", pool),
    guaranteed: toGachaRarityRates(GACHA_TEN_PULL_GUARANTEE, pool),
  }
  const serverRateOf = (rarity: GachaRarity, kind: "normal" | "guaranteed") =>
    data?.gachaRates.rarityRates.find((rate) => rate.rarity === rarity)?.[
      kind
    ] ?? null
  const normal = Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [
      rarity,
      serverRateOf(rarity, "normal") ?? local.normal[rarity],
    ]),
  ) as Record<GachaRarity, number>
  const guaranteed = Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [
      rarity,
      serverRateOf(rarity, "guaranteed") ?? local.guaranteed[rarity],
    ]),
  ) as Record<GachaRarity, number>
  const remaining =
    data?.gachaRates.remainingUniquePrizes ?? GACHA_UNIQUE_PRIZES.length
  const total = GACHA_UNIQUE_PRIZES.length
  const prizes = [...GACHA_POOL].sort(
    (a, b) =>
      RARITIES_DESC.indexOf(a.rarity) - RARITIES_DESC.indexOf(b.rarity) ||
      a.kind.localeCompare(b.kind),
  )
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 pb-16 text-sm leading-relaxed">
      <header className="space-y-2">
        <h1 className="font-black text-2xl">
          スペシャル枠ガチャの提供割合・ご注意
        </h1>
        <p className="text-muted-foreground">
          <Link to="/gacha" className="underline underline-offset-2">
            ガチャのページへ戻る
          </Link>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">料金</h2>
        <table className="w-full border text-left">
          <tbody className="[&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-muted [&_th]:p-2">
            <tr>
              <th>プレミアムコイン（有償）で 1 回</th>
              <td>{GACHA_PRICES.premiumSingle.toLocaleString()} 枚</td>
            </tr>
            <tr>
              <th>プレミアムコイン（有償）で 10 連</th>
              <td>
                {GACHA_PRICES.premiumTen.toLocaleString()} 枚（1 日 1
                回目だけ半額の {GACHA_PRICES.premiumDailyTen.toLocaleString()}{" "}
                枚）
              </td>
            </tr>
            <tr>
              <th>フリーコイン（無償）で 1 回</th>
              <td>
                {GACHA_PRICES.free} 枚（1 日 {GACHA_FREE_DAILY_LIMIT} 回まで。10
                連はありません）
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted-foreground text-xs">
          「1 日」は日本時間の 0:00
          で切り替わります。プレミアムコインで引くときはプレミアムコインだけ、フリーコインで引くときはフリーコインだけを使います。プレミアムコインは
          1 枚あたり 0.8
          円（税込）で販売しています（まとめ買いのおまけを除く）。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">レア度ごとの提供割合</h2>
        <table className="w-full border text-left">
          <thead className="[&_th]:border [&_th]:bg-muted [&_th]:p-2">
            <tr>
              <th>レア度</th>
              <th>種類</th>
              <th>通常</th>
              <th>10 連の 10 枠目（確定枠）</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border [&_td]:p-2">
            {RARITIES_DESC.map((rarity) => (
              <tr key={rarity}>
                <td>
                  <RarityBadge rarity={rarity} />
                </td>
                <td>
                  {rarity === "UUR"
                    ? `${remaining} 種（全 ${total} 種）`
                    : `${GACHA_POOL.filter((p) => p.rarity === rarity).length} 種`}
                </td>
                <td>{formatGachaRate(normal[rarity])}</td>
                <td>{formatGachaRate(guaranteed[rarity])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
          <li>
            上の表は、いまの UUR の残り数（{remaining} / {total}
            ）での実際の割合です
            {data ? "" : "（読み込み中は全部残っているときの値）"}。
          </li>
          <li>1 回引きと、10 連の 1〜9 枠目は「通常」の割合です。</li>
          <li>
            10 連の 10 枠目は、1〜9 枠目に {GACHA_TEN_PULL_GUARANTEE}{" "}
            以上が出ていないときだけ「確定枠」の割合（{GACHA_TEN_PULL_GUARANTEE}{" "}
            以上だけ）で抽選します。出ているときは「通常」の割合です。
          </li>
          <li>
            同じレア度の中では、どの景品も同じ割合です。持っているかどうかで割合は変わりません（UUR
            は下の「UUR について」のとおり、取られた枠がなくなります）。
          </li>
          <li>
            抽選は 1 回ずつ独立して、サーバーで行います。表示の割合は小数第 3
            位あたりで丸めています。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <RarityBadge rarity="UUR" />
          UUR について（世界でひとりだけの枠）
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            UUR は全 {total} 種で、どれも最初に当てた 1
            人だけが持てます。誰かが当てた枠はその時点でガチャから抜け、ほかの人には二度と出ません。
          </li>
          <li>
            UUR の割合は 1 回あたり合計 {formatGachaRate(GACHA_RATES.UUR)}
            （10 連の 10 枠目の確定枠も同じ）で、残っている UUR
            で等分します。いまは {remaining} 種が残っていて、1 種あたり{" "}
            {formatGachaRate(
              data?.gachaRates.uniquePrizeRate ??
                (remaining > 0 ? GACHA_RATES.UUR / remaining : 0),
            )}
            です。
          </li>
          <li>
            この {formatGachaRate(GACHA_RATES.UUR)} は {GACHA_UNIQUE_FALLBACK}{" "}
            の割合から引いています（UUR を入れる前の {GACHA_UNIQUE_FALLBACK} は{" "}
            {formatGachaRate(GACHA_RATES.N + GACHA_RATES.UUR)}、いまは{" "}
            {formatGachaRate(GACHA_RATES.N)}
            ）。ほかのレア度の割合は変わりません。{total} 種すべてが取られたら
            UUR は 0% になり、{GACHA_UNIQUE_FALLBACK} は{" "}
            {formatGachaRate(GACHA_RATES.N + GACHA_RATES.UUR)} に戻ります。
          </li>
          <li>
            確定枠では、UUR が残っていれば UUR が{" "}
            {formatGachaRate(GACHA_RATES.UUR)}、残りの{" "}
            {formatGachaRate(100 - GACHA_RATES.UUR)} を{" "}
            {GACHA_TEN_PULL_GUARANTEE} 以上で分けます。UUR は{" "}
            {GACHA_TEN_PULL_GUARANTEE} 以上として数えます。
          </li>
          <li>
            UUR は交換
            pt・かけらでは交換できません（ガチャで当てた人だけのものです）。かぶることもありません。
          </li>
          <li>
            同時に引いた人が同じ UUR に当たったときは、先に記録された 1
            人のものになり、もう 1 人の枠は UUR を除いて引き直します（10
            連でその UUR がただ 1 つの {GACHA_TEN_PULL_GUARANTEE}{" "}
            以上だったときは {GACHA_TEN_PULL_GUARANTEE} 以上で引き直します）。
          </li>
          <li>
            当てた人はふつうの景品と同じように着けられます。ガチャのページに、当てた人の名前・アイコンと日付が載ります（退会した人は「退会したユーザー」と出ます）。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">天井（交換 pt）・かぶり（かけら）</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            1 回引くごとに交換 pt が 1 たまります（10 連は
            10、フリーコインで引いても 1）。{GACHA_EXCHANGE_POINTS} pt
            で、ラインナップの中からまだ持っていない景品を 1
            つ選んでもらえます（UR も選べます。UUR は選べません）。UR が出ても
            pt は減りません。
          </li>
          <li>
            すでに持っている景品が出たときは、かけらになります（
            {SHARD_RARITIES.map(
              (r) => `${r} ${GACHA_DUPLICATE_SHARDS[r]} 個`,
            ).join("・")}
            ）。かけらで、まだ持っていない景品と交換できます（
            {SHARD_RARITIES.map(
              (r) => `${r} ${GACHA_EXCHANGE_SHARDS[r].toLocaleString()} 個`,
            ).join("・")}
            ）。
          </li>
          <li>
            交換 pt
            とかけらに有効期限はありません。ガチャを終える・ラインナップを入れ替えるときは、扱いを
            30 日以上前にお知らせします。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">景品ごとの提供割合</h2>
        <table className="w-full border text-left text-xs">
          <thead className="[&_th]:border [&_th]:bg-muted [&_th]:p-2">
            <tr>
              <th>レア度</th>
              <th>景品</th>
              <th>種類</th>
              <th>通常</th>
              <th>確定枠</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border [&_td]:p-2">
            {prizes.map((prize) => (
              <tr key={prize.id}>
                <td>
                  <RarityBadge rarity={prize.rarity} />
                </td>
                <td>
                  {prize.name}
                  {isUniqueGachaPrize(prize) && takenIds.includes(prize.id) && (
                    <span className="ml-1 text-muted-foreground">
                      （獲得済み）
                    </span>
                  )}
                </td>
                <td>
                  {prize.kind === "ICON_FRAME" ? "アイコン枠" : "ヘッダー枠"}
                </td>
                <td>
                  {formatGachaRate(toGachaPrizeRate(prize, "normal", pool))}
                </td>
                <td>
                  {formatGachaRate(toGachaPrizeRate(prize, "guaranteed", pool))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">ご注意</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            景品は Aipictors
            のアカウントで使える見た目の飾り（アイコン枠・ヘッダー枠）です。お金や他のサービスのものとの交換、ほかの人への譲渡、払い戻しはできません。
          </li>
          <li>
            引いたあとの取り消し・コインの返却はできません（不具合で景品が付かなかったときは、お問い合わせください）。
          </li>
          <li>特定の景品をそろえると別の景品がもらえる仕組みはありません。</li>
          <li>
            購入したプレミアムコインは購入日から 3
            か月で失効します。未成年の方は、保護者の方の同意を得てからプレミアムコインを購入してください。
          </li>
          <li>
            提供割合・料金・ラインナップを変えるときは、事前にこのページとお知らせでお伝えします。
          </li>
          <li>
            くわしくは
            <Link
              to="/premium-coins/policy"
              className="underline underline-offset-2"
            >
              プレミアムコイン規約
            </Link>
            ・
            <Link
              to="/specified-commercial-transaction-act"
              className="underline underline-offset-2"
            >
              特定商取引法に基づく表記
            </Link>
            ・
            <Link to="/terms" className="underline underline-offset-2">
              利用規約
            </Link>
            をご覧ください。
          </li>
        </ul>
      </section>
    </article>
  )
}
