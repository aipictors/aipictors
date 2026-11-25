import { Loader2Icon, SparklesIcon, Undo2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { autoMosaicImage, isAnimatedImageDataUrl } from "~/utils/auto-mosaic"

const VISIBILITY_KEY = "post-auto-mosaic-bar"

type Visibility = "auto" | "on" | "off"

/**
 * 一括の自動モザイクを出すかどうか。年齢種別が R18 / R18G のときだけ出す
 * （全年齢の投稿では「表示する」にしていても出さない）
 * - auto / on: 出す
 * - off: 投稿者が「表示しない」にした
 */
export function useAutoMosaicBarVisibility(isSensitiveHint: boolean) {
  const [visibility, setVisibilityState] = useState<Visibility>("auto")

  useEffect(() => {
    const stored = localStorage.getItem(VISIBILITY_KEY)
    if (stored === "on" || stored === "off") setVisibilityState(stored)
  }, [])

  const setVisibility = (value: Visibility) => {
    setVisibilityState(value)
    if (value === "auto") localStorage.removeItem(VISIBILITY_KEY)
    else localStorage.setItem(VISIBILITY_KEY, value)
  }

  const isVisible = isSensitiveHint && visibility !== "off"

  return { isVisible, setVisibility }
}

type Props = {
  items: TSortableItem[]
  setItems(items: TSortableItem[]): void
  onHide(): void
}

/**
 * 投稿画面: 選んだ画像すべてに自動モザイク（ベータ）をかける
 * 検出は投稿者のブラウザの中で動く（サーバーは使わない）
 */
export function PostFormAutoMosaicBar(props: Props) {
  const t = useTranslation()
  const [isNipples, setIsNipples] = useState(false)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  // 一括でかけた分を戻すための元の画像（id ごと）
  const [lastResult, setLastResult] = useState<{
    before: Map<number, string>
    after: Map<number, string>
  } | null>(null)

  const itemsRef = useRef(props.items)
  itemsRef.current = props.items

  const targets = props.items.filter(
    (item) => item.content !== null && !isAnimatedImageDataUrl(item.content),
  )

  const run = async () => {
    if (progress !== null || targets.length === 0) return
    const before = new Map<number, string>()
    const after = new Map<number, string>()
    let areaCount = 0
    let failedCount = 0
    setProgress({ done: 0, total: targets.length })
    for (const [index, item] of targets.entries()) {
      if (item.content === null) continue
      try {
        const result = await autoMosaicImage(item.content, {
          includeNipples: isNipples,
        })
        if (result.dataUrl !== null) {
          before.set(item.id, item.content)
          after.set(item.id, result.dataUrl)
          areaCount += result.count
        }
      } catch (error) {
        console.error(error)
        failedCount++
      }
      setProgress({ done: index + 1, total: targets.length })
    }
    // 処理中に並べ替え・削除されても、残っている画像だけ差し替える
    if (after.size > 0) {
      props.setItems(
        itemsRef.current.map((item) => {
          const content = after.get(item.id)
          return content !== undefined && item.content === before.get(item.id)
            ? { ...item, content, isContentEdited: true }
            : item
        }),
      )
      setLastResult({ before, after })
    }
    setProgress(null)

    if (failedCount === targets.length) {
      toast.error(
        t(
          "自動モザイクに失敗しました。各画像の鉛筆ボタンから手でかけてください",
          "Auto mosaic failed. Please add mosaics by hand with the pencil button",
        ),
      )
    } else if (after.size === 0) {
      toast(
        t(
          "モザイクが必要な所は見つかりませんでした。必要なら各画像の鉛筆ボタンから手でかけてください",
          "Nothing to mosaic was found. Use the pencil button on each image if needed",
        ),
      )
    } else {
      toast(
        t(
          `${targets.length}枚中${after.size}枚（${areaCount}か所）にモザイクをかけました。見落としが無いか確かめて、足りない所は鉛筆ボタンで足してください`,
          `Applied mosaic to ${after.size} of ${targets.length} image(s) (${areaCount} areas). Please check and fix with the pencil button`,
        ),
      )
    }
  }

  const undo = () => {
    if (lastResult === null) return
    props.setItems(
      props.items.map((item) => {
        const content = lastResult.before.get(item.id)
        return content !== undefined &&
          item.content === lastResult.after.get(item.id)
          ? { ...item, content }
          : item
      }),
    )
    setLastResult(null)
  }

  return (
    <div className="mx-2 mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white">
      <div className="min-w-0 flex-1 basis-48 text-xs leading-5">
        <div className="font-bold">
          {t(
            "センシティブ作品向け: 自動モザイク",
            "For sensitive works: auto mosaic",
          )}
          <span className="ml-1 rounded bg-white/20 px-1 text-[10px]">β</span>
        </div>
        <div className="text-zinc-400">
          {t(
            "性器を見つけて、形に沿ってモザイクをかけます。見落としもあるので最後は確かめてください",
            "Finds genitals and mosaics them along their shape. It can miss some, so please check",
          )}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          className="size-4"
          checked={isNipples}
          onChange={(e) => setIsNipples(e.target.checked)}
        />
        {t("乳首も", "Nipples")}
      </label>
      {lastResult !== null && progress === null && (
        <Button
          size="sm"
          variant="secondary"
          className="h-9 rounded-full"
          onClick={undo}
        >
          <Undo2Icon className="mr-1 size-4" />
          {t("元に戻す", "Undo")}
        </Button>
      )}
      <Button
        size="sm"
        className="h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700"
        disabled={progress !== null || targets.length === 0}
        onClick={run}
      >
        {progress !== null ? (
          <Loader2Icon className="mr-1 size-4 animate-spin" />
        ) : (
          <SparklesIcon className="mr-1 size-4" />
        )}
        {progress !== null
          ? t(
              `処理中 ${progress.done}/${progress.total}`,
              `Processing ${progress.done}/${progress.total}`,
            )
          : t(
              `${targets.length}枚に一括でモザイク`,
              `Mosaic all ${targets.length}`,
            )}
      </Button>
      <button
        type="button"
        className="text-xs text-zinc-400 underline-offset-2 hover:underline"
        onClick={props.onHide}
      >
        {t("表示しない", "Hide")}
      </button>
    </div>
  )
}
