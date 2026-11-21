import type { MetaFunction } from "@remix-run/cloudflare"
import { RarityBadge } from "~/components/gacha/admin-gacha-parts"
import { GACHA_RARITIES } from "~/components/gacha/gacha-direction"
import {
  formatGachaRate,
  GACHA_DUPLICATE_SHARDS,
  GACHA_EXCHANGE_POINTS,
  GACHA_EXCHANGE_SHARDS,
  GACHA_FREE_DAILY_LIMIT,
  GACHA_POOL,
  GACHA_PRICES,
  GACHA_TEN_PULL_GUARANTEE,
  toGachaPrizeRate,
  toGachaRarityRates,
} from "~/components/gacha/gacha-rules"
import { Link } from "~/lib/app/locale-router"
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

/**
 * 提供割合（確率）とご注意。表の値は gacha-rules.ts から作るので、抽選の値（サーバーも同じ値）と食い違わない
 */
export default function GachaRatesRoute() {
  const normal = toGachaRarityRates()
  const guaranteed = toGachaRarityRates(GACHA_TEN_PULL_GUARANTEE)
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
                1 日 1 回目 {GACHA_PRICES.freeFirst} 枚、2 回目から{" "}
                {GACHA_PRICES.freeSingle} 枚（1 日 {GACHA_FREE_DAILY_LIMIT}{" "}
                回まで。10 連はありません）
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
                  {GACHA_POOL.filter((p) => p.rarity === rarity).length} 種
                </td>
                <td>{formatGachaRate(normal[rarity])}</td>
                <td>{formatGachaRate(guaranteed[rarity])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
          <li>1 回引きと、10 連の 1〜9 枠目は「通常」の割合です。</li>
          <li>
            10 連の 10 枠目は、1〜9 枠目に {GACHA_TEN_PULL_GUARANTEE}{" "}
            以上が出ていないときだけ「確定枠」の割合（{GACHA_TEN_PULL_GUARANTEE}{" "}
            以上だけ）で抽選します。出ているときは「通常」の割合です。
          </li>
          <li>
            同じレア度の中では、どの景品も同じ割合です。持っているかどうかで割合は変わりません。
          </li>
          <li>
            抽選は 1 回ずつ独立して、サーバーで行います。表示の割合は小数第 3
            位あたりで丸めています。
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
            つ選んでもらえます（UR も選べます）。UR が出ても pt は減りません。
          </li>
          <li>
            すでに持っている景品が出たときは、かけらになります（
            {RARITIES_DESC.map(
              (r) => `${r} ${GACHA_DUPLICATE_SHARDS[r]} 個`,
            ).join("・")}
            ）。かけらで、まだ持っていない景品と交換できます（
            {RARITIES_DESC.map(
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
                <td>{prize.name}</td>
                <td>
                  {prize.kind === "ICON_FRAME" ? "アイコン枠" : "ヘッダー枠"}
                </td>
                <td>{formatGachaRate(toGachaPrizeRate(prize))}</td>
                <td>
                  {formatGachaRate(toGachaPrizeRate(prize, "guaranteed"))}
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
