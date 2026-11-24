import { useMutation, useQuery } from "@apollo/client/index"
import { Check, Lock } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  PrizeThumbnail,
  RarityBadge,
} from "~/components/gacha/admin-gacha-parts"
import {
  GACHA_RARITIES,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import type { GachaPrize } from "~/components/gacha/gacha-prizes"
import {
  GACHA_EXCHANGE_POINTS,
  GACHA_EXCHANGE_SHARDS,
  GACHA_POOL,
  isUniqueGachaPrize,
} from "~/components/gacha/gacha-rules"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"
import type { SpecialGachaState } from "~/routes/($lang)._main.gacha._index/components/special-gacha-page"
import {
  applyGachaAvatarFrameMutation,
  exchangeGachaPrizeMutation,
  gachaAvatarFramesQuery,
  selectGachaHeaderFrameMutation,
} from "~/routes/($lang)._main.gacha._index/components/special-gacha-queries"

const RARITIES_DESC = [...GACHA_RARITIES].reverse()

/**
 * 集めた枠。持っている枠は着ける・外す、持っていない枠は交換 pt かかけらで交換できる
 */
export function SpecialGachaCollection(props: {
  state: SpecialGachaState
  onStateChange: (state: SpecialGachaState) => void
}) {
  const [kind, setKind] = useState<GachaPrize["kind"]>("ICON_FRAME")
  const [selected, setSelected] = useState<GachaPrize | null>(null)
  const owned = useMemo(
    () =>
      new Map(
        props.state.ownedPrizes.map((item) => [item.prizeId, item.count]),
      ),
    [props.state.ownedPrizes],
  )
  const frames = useQuery(gachaAvatarFramesQuery, {
    fetchPolicy: "cache-and-network",
  })
  const [exchange, { loading: isExchanging }] = useMutation(
    exchangeGachaPrizeMutation,
  )
  const [selectHeader, { loading: isSelectingHeader }] = useMutation(
    selectGachaHeaderFrameMutation,
  )
  const [applyIcon, { loading: isApplyingIcon }] = useMutation(
    applyGachaAvatarFrameMutation,
  )

  // UUR（世界で 1 人だけ）はコンプリートの数に入れず、持っているときだけ並べる
  const collectable = GACHA_POOL.filter((prize) => !isUniqueGachaPrize(prize))
  const prizes = GACHA_POOL.filter(
    (prize) =>
      prize.kind === kind &&
      (!isUniqueGachaPrize(prize) || owned.has(prize.id)),
  ).sort(
    (a, b) => RARITIES_DESC.indexOf(a.rarity) - RARITIES_DESC.indexOf(b.rarity),
  )
  const ownedCount = collectable.filter((prize) => owned.has(prize.id)).length
  const selectedIconFrameId =
    frames.data?.userSetting?.selectedUserAvatarFrame?.id ?? null
  const iconFrameIdOf = (prize: GachaPrize) =>
    frames.data?.userAvatarFrames.find((frame) => frame.slug === prize.slug)
      ?.id ?? null
  const isWearing = (prize: GachaPrize) =>
    prize.kind === "HEADER_FRAME"
      ? props.state.selectedHeaderFrameSlug === prize.slug
      : selectedIconFrameId !== null &&
        selectedIconFrameId === iconFrameIdOf(prize)

  const doExchange = async (prize: GachaPrize, method: "POINTS" | "SHARDS") => {
    try {
      const result = await exchange({
        variables: { input: { prizeId: prize.id, method } },
      })
      if (result.data) props.onStateChange(result.data.exchangeGachaPrize)
      await frames.refetch()
      toast.success(`「${prize.name}」を手に入れました`)
      setSelected(prize)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "交換できませんでした",
      )
    }
  }

  const wear = async (prize: GachaPrize, on: boolean) => {
    try {
      if (prize.kind === "HEADER_FRAME") {
        const result = await selectHeader({
          variables: { input: { slug: on ? prize.slug : null } },
        })
        if (result.data) props.onStateChange(result.data.selectGachaHeaderFrame)
      } else {
        const frameId = on ? iconFrameIdOf(prize) : null
        if (on && frameId === null) {
          toast.error("枠を読み込み中です。少し待ってからお試しください")
          return
        }
        await applyIcon({
          variables: { input: { selectedUserAvatarFrameId: frameId } },
        })
        await frames.refetch()
      }
      toast.success(on ? "着けました" : "外しました")
      setSelected(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "変更できませんでした",
      )
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-black text-lg">
          コレクション{" "}
          <span className="font-bold text-muted-foreground text-sm">
            {ownedCount} / {collectable.length}
          </span>
        </h2>
        <span className="text-muted-foreground text-xs">
          交換 pt {props.state.exchangePoints.toLocaleString()}・かけら{" "}
          {props.state.shards.toLocaleString()}
        </span>
      </div>
      <div className="flex gap-2">
        {(["ICON_FRAME", "HEADER_FRAME"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={cn(
              "rounded-full px-4 py-1.5 font-bold text-sm",
              kind === value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground",
            )}
          >
            {value === "ICON_FRAME" ? "アイコン枠" : "ヘッダー枠"}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "grid gap-3",
          kind === "ICON_FRAME"
            ? "grid-cols-3 sm:grid-cols-5 md:grid-cols-6"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {prizes.map((prize) => {
          const count = owned.get(prize.id) ?? 0
          return (
            <button
              key={prize.id}
              type="button"
              onClick={() => setSelected(prize)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl p-2 text-center transition hover:bg-muted",
                isWearing(prize) && "ring-2 ring-pink-400",
              )}
            >
              <div className={cn(count === 0 && "opacity-35 grayscale")}>
                <PrizeThumbnail prize={prize} />
              </div>
              {count === 0 && (
                <Lock className="absolute top-2 right-2 size-3.5 text-muted-foreground" />
              )}
              {isWearing(prize) && (
                <Check className="absolute top-2 right-2 size-4 text-pink-500" />
              )}
              <RarityBadge rarity={prize.rarity} />
              <span className="line-clamp-1 text-xs">{prize.name}</span>
              {count > 1 && (
                <span className="text-[10px] text-muted-foreground">
                  ×{count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <PrizeDialog
          prize={selected}
          isOwned={(owned.get(selected.id) ?? 0) > 0}
          isWearing={isWearing(selected)}
          exchangePoints={props.state.exchangePoints}
          shards={props.state.shards}
          isBusy={isExchanging || isSelectingHeader || isApplyingIcon}
          onClose={() => setSelected(null)}
          onExchange={(method) => doExchange(selected, method)}
          onWear={(on) => wear(selected, on)}
        />
      )}
    </section>
  )
}

function PrizeDialog(props: {
  prize: GachaPrize
  isOwned: boolean
  isWearing: boolean
  exchangePoints: number
  shards: number
  isBusy: boolean
  onClose: () => void
  onExchange: (method: "POINTS" | "SHARDS") => void
  onWear: (on: boolean) => void
}) {
  const shardCost = GACHA_EXCHANGE_SHARDS[props.prize.rarity as GachaRarity]
  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <RarityBadge rarity={props.prize.rarity} />
          {props.prize.name}
        </DialogTitle>
        <DialogDescription>
          {props.prize.kind === "ICON_FRAME" ? "アイコン枠" : "ヘッダー枠"}・
          {props.prize.description}
        </DialogDescription>
        <div className="flex justify-center py-2">
          <PrizeThumbnail prize={props.prize} />
        </div>
        {props.isOwned ? (
          <Button
            disabled={props.isBusy}
            variant={props.isWearing ? "secondary" : "default"}
            onClick={() => props.onWear(!props.isWearing)}
          >
            {props.isWearing ? "外す" : "着ける"}
          </Button>
        ) : isUniqueGachaPrize(props.prize) ? (
          <p className="text-center text-muted-foreground text-xs">
            UUR
            は世界でひとりだけの枠です。ガチャで最初に当てた人だけが持てて、交換
            pt・かけらでは交換できません
          </p>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={
                props.isBusy || props.exchangePoints < GACHA_EXCHANGE_POINTS
              }
              onClick={() => props.onExchange("POINTS")}
            >
              交換 pt {GACHA_EXCHANGE_POINTS} で交換（いま{" "}
              {props.exchangePoints}）
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              disabled={props.isBusy || props.shards < shardCost}
              onClick={() => props.onExchange("SHARDS")}
            >
              かけら {shardCost.toLocaleString()} で交換（いま{" "}
              {props.shards.toLocaleString()}）
            </Button>
            <p className="text-center text-muted-foreground text-xs">
              交換 pt は 1 回引くごとに 1 たまります
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
