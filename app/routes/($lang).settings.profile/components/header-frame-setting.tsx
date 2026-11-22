import { useMutation, useQuery } from "@apollo/client/index"
import { CheckIcon, Loader2Icon, LockIcon, SparklesIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { RarityBadge } from "~/components/gacha/admin-gacha-parts"
import { gachaRarityRank } from "~/components/gacha/gacha-direction"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  selectGachaHeaderFrameMutation,
  viewerGachaQuery,
} from "~/routes/($lang)._main.gacha._index/components/special-gacha-queries"

const HEADER_FRAMES = GACHA_PRIZES.filter(
  (prize) => prize.kind === "HEADER_FRAME",
).sort((a, b) => gachaRarityRank(b.rarity) - gachaRarityRank(a.rarity))

type Props = {
  /** 選んだ枠を重ねて見せる、今のヘッダー画像（編集中のものを含む） */
  headerImageSrc?: string | null
  /** 着けている枠（読み込みが終わったとき・変えたとき）。上のプレビューに重ねる */
  onSelectedChange(slug: string | null): void
}

/**
 * プロフィールのヘッダー枠。ガチャで手に入れた枠から選ぶと、すぐ反映される（アイコン枠と同じ）
 * 持っていないときは、ガチャで手に入ることを見本と一緒に案内する
 */
export function HeaderFrameSetting(props: Props) {
  const t = useTranslation()
  const { data, loading } = useQuery(viewerGachaQuery, {
    fetchPolicy: "cache-and-network",
  })
  const [select, { loading: isSelecting }] = useMutation(
    selectGachaHeaderFrameMutation,
  )
  // 押した枠に読み込み中の印を出す（undefined: 何も押していない）
  const [pendingSlug, setPendingSlug] = useState<string | null | undefined>(
    undefined,
  )

  const state = data?.viewerGacha ?? null
  const selectedSlug = state?.selectedHeaderFrameSlug ?? null

  useEffect(() => {
    props.onSelectedChange(selectedSlug)
  }, [selectedSlug])

  const owned = useMemo(() => {
    const ids = new Set(state?.ownedPrizes.map((item) => item.prizeId) ?? [])
    return HEADER_FRAMES.filter((prize) => ids.has(prize.id))
  }, [state])

  const apply = async (slug: string | null) => {
    if (slug === selectedSlug || isSelecting) return
    setPendingSlug(slug)
    try {
      await select({
        variables: { input: { slug } },
        update(cache, result) {
          const next = result.data?.selectGachaHeaderFrame
          if (next) {
            cache.writeQuery({
              query: viewerGachaQuery,
              data: { viewerGacha: next },
            })
          }
        },
      })
      toast.success(
        slug === null
          ? t("ヘッダー枠を外しました", "Header frame removed")
          : t("ヘッダー枠を着けました", "Header frame applied"),
      )
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t("変更できませんでした", "Couldn't change the frame"),
      )
    } finally {
      setPendingSlug(undefined)
    }
  }

  if (loading && state === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="aspect-[3/1] animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    )
  }

  if (owned.length === 0) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {HEADER_FRAMES.filter((prize) => prize.inPool)
            .slice(0, 3)
            .map((prize) => (
              <div key={prize.id} className="relative">
                <FramePreview
                  prize={prize}
                  headerImageSrc={props.headerImageSrc}
                  className="opacity-60 grayscale-[40%]"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-7 items-center justify-center rounded-full bg-background/80 shadow-sm">
                    <LockIcon className="size-3.5 text-muted-foreground" />
                  </span>
                </span>
              </div>
            ))}
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-muted-foreground text-xs leading-5">
            {t(
              `ヘッダー画像のふちを飾る枠です（全 ${HEADER_FRAMES.length} 種）。スペシャル枠ガチャで手に入ります。`,
              `Frames that decorate the edge of your header (${HEADER_FRAMES.length} kinds). Get them from the special frame gacha.`,
            )}
          </p>
          <Button asChild size="sm" className="shrink-0 rounded-full">
            <Link to="/gacha">
              <SparklesIcon className="mr-1.5 size-4" />
              {t("ガチャを見る", "Open the gacha")}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <FrameOption
          isSelected={selectedSlug === null}
          isPending={pendingSlug === null}
          disabled={isSelecting}
          label={t("枠なし", "No frame")}
          onSelect={() => void apply(null)}
        >
          <div className="relative aspect-[3/1] overflow-hidden rounded-lg bg-muted">
            {props.headerImageSrc && (
              <img
                src={props.headerImageSrc}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>
        </FrameOption>
        {owned.map((prize) => (
          <FrameOption
            key={prize.id}
            isSelected={selectedSlug === prize.slug}
            isPending={pendingSlug === prize.slug}
            disabled={isSelecting}
            label={prize.name}
            badge={<RarityBadge rarity={prize.rarity} />}
            onSelect={() => void apply(prize.slug)}
          >
            <FramePreview prize={prize} headerImageSrc={props.headerImageSrc} />
          </FrameOption>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        {t(
          `${owned.length} / ${HEADER_FRAMES.length} 種を持っています。選ぶとすぐプロフィールに反映されます。`,
          `You own ${owned.length} of ${HEADER_FRAMES.length}. Changes apply right away.`,
        )}{" "}
        <Link
          to="/gacha"
          className="text-foreground underline underline-offset-2"
        >
          {t("ガチャでもっと集める", "Collect more")}
        </Link>
      </p>
    </div>
  )
}

function FrameOption(props: {
  isSelected: boolean
  isPending: boolean
  disabled: boolean
  label: string
  badge?: React.ReactNode
  onSelect(): void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={props.isSelected}
      disabled={props.disabled && !props.isSelected}
      onClick={props.onSelect}
      className={cn(
        "group relative rounded-xl border bg-background p-1.5 text-left transition-all hover:border-primary/50 hover:shadow-sm disabled:opacity-60",
        props.isSelected && "border-primary ring-2 ring-primary/30",
      )}
    >
      {props.children}
      <span className="mt-1.5 flex items-center gap-1.5 px-0.5">
        {props.badge}
        <span className="min-w-0 flex-1 truncate font-medium text-xs">
          {props.label}
        </span>
      </span>
      {(props.isSelected || props.isPending) && (
        <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          {props.isPending ? (
            <Loader2Icon className="size-3 animate-spin" />
          ) : (
            <CheckIcon className="size-3" />
          )}
        </span>
      )}
    </button>
  )
}

/** 枠の見本。今のヘッダー画像（なければ落ち着いた色）に枠の絵を重ねる */
function FramePreview(props: {
  prize: GachaPrize
  headerImageSrc?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/1] overflow-hidden rounded-lg bg-gradient-to-br from-slate-500 to-slate-700",
        props.className,
      )}
    >
      {props.headerImageSrc && (
        <img
          src={props.headerImageSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <img
        src={props.prize.imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-fill"
      />
    </div>
  )
}
