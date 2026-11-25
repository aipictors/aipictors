import {
  Loader2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  Undo2Icon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import {
  autoMosaicImage,
  isAnimatedImageDataUrl,
  preloadAutoMosaic,
} from "~/utils/auto-mosaic"

type Props = {
  items: TSortableItem[]
  setItems(items: TSortableItem[]): void
}

/**
 * 投稿画面: 選んだ画像すべてに自動モザイク（ベータ）をかける
 * 検出は投稿者のブラウザの中で動く（サーバーは使わない）
 */
export function PostFormAutoMosaicBar(props: Props) {
  const t = useTranslation()
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

  // 帯が出たら（R18 の投稿）検出の部品を先に読んでおく。押してから読むと 1 枚目がとても遅い
  useEffect(() => {
    preloadAutoMosaic()
  }, [])

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
        const result = await autoMosaicImage(item.content)
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
    <div className="mx-2 mb-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-white">
      <div className="flex items-start gap-2.5">
        <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1 text-xs leading-5">
          <p className="font-bold text-sm">
            {t(
              "R18 作品は投稿するときに自動でモザイクがかかります",
              "R18 works are mosaicked automatically when you post",
            )}
          </p>
          <p className="text-zinc-300">
            {t(
              "性器・肛門を見つけて、形に沿ってモザイクをかけます（乳首は対象外です）。自動でモザイクをかけた作品を、モザイクの不足を理由に運営が非公開にすることは基本的にありません。",
              "Genitals and anus are detected and mosaicked along their shape (nipples are not included). Works mosaicked automatically are generally not hidden by moderators for insufficient mosaic.",
            )}
          </p>
          <p className="text-zinc-400">
            {t(
              "GIF・動画は対象外です。手で足したいときは各画像の鉛筆ボタンから。",
              "GIFs and videos are not included. To add more by hand, use the pencil button on each image.",
            )}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        {lastResult !== null && progress === null && (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 rounded-full"
            onClick={undo}
          >
            <Undo2Icon className="mr-1 size-4" />
            {t("元に戻す", "Undo")}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
                `モザイク処理中 ${progress.done}/${progress.total}`,
                `Mosaicking ${progress.done}/${progress.total}`,
              )
            : t("先にかけて仕上がりを見る", "Preview the mosaic now")}
        </Button>
      </div>
    </div>
  )
}
