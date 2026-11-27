import { ZoomInIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { AutoMosaicZoomViewer } from "~/routes/($lang)._main.new.image/components/auto-mosaic-zoom-viewer"

type Props = {
  /** 自動でモザイクをかけた画像（かけた後）。null なら閉じている */
  previews: string[] | null
  /** true: このまま投稿する、false: 戻って直す */
  onClose: (isConfirmed: boolean) => void
}

/**
 * 投稿の直前に、自動でかけたモザイクを確かめてもらう
 * 自動の検出は誤ることがある（かけすぎ・足りない）ので、直してから投稿できるようにする
 * 画像を押すとダイアログを全画面に広げて拡大表示し、細かい所まで確かめられる
 */
export function AutoMosaicConfirmDialog(props: Props) {
  const t = useTranslation()
  const previews = props.previews ?? []
  /** 拡大表示している画像の番号（null なら一覧） */
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const isZoomed = zoomIndex !== null

  // 開き直したら一覧から始める
  useEffect(() => {
    if (props.previews === null) setZoomIndex(null)
  }, [props.previews])

  const description = t(
    `${previews.length}枚に自動でモザイクをかけました。自動の検出は誤ることがあります。必要のない所にかかっている・足りない所がある場合は、「修正する」から各画像の鉛筆ボタンで範囲を直してください。`,
    `An automatic mosaic was applied to ${previews.length} image(s). Automatic detection can be wrong. If it covers areas that don't need it or misses areas, choose "Fix" and adjust each image with the pencil button.`,
  )

  return (
    <AlertDialog
      open={props.previews !== null}
      onOpenChange={(open) => {
        if (!open) props.onClose(false)
      }}
    >
      <AlertDialogContent
        className={cn(
          isZoomed
            ? "inset-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-black p-0 sm:rounded-none"
            : "max-h-[90dvh] overflow-y-auto",
        )}
        onEscapeKeyDown={(e) => {
          // 拡大表示中の Esc は一覧に戻るだけにする（ダイアログは閉じない）
          if (isZoomed) {
            e.preventDefault()
            setZoomIndex(null)
          }
        }}
      >
        <AlertDialogHeader className={cn(isZoomed && "sr-only")}>
          <AlertDialogTitle>
            {t(
              "自動でかけたモザイクを確認してください",
              "Please check the automatic mosaic",
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {isZoomed ? (
          <AutoMosaicZoomViewer
            previews={previews}
            index={zoomIndex}
            onIndexChange={setZoomIndex}
            onBack={() => setZoomIndex(null)}
            onFix={() => props.onClose(false)}
            onConfirm={() => props.onClose(true)}
          />
        ) : (
          <>
            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <ZoomInIcon className="size-3.5 shrink-0" />
              {t(
                "画像を押すと拡大して細かい所まで確認できます",
                "Tap an image to zoom in and check the details",
              )}
            </p>
            <div
              className={cn(
                "grid gap-2",
                previews.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2 sm:grid-cols-3",
              )}
            >
              {previews.map((preview, index) => (
                <button
                  // 同じ画像が並ぶこともあるので順番も使う
                  key={`${index}-${preview.slice(-32)}`}
                  type="button"
                  className="group relative overflow-hidden rounded-md bg-black/40 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={t(
                    `${index + 1}枚目を拡大して確認`,
                    `Zoom in on image ${index + 1}`,
                  )}
                  onClick={() => setZoomIndex(index)}
                >
                  <img
                    src={preview}
                    alt={t(`${index + 1}枚目`, `Image ${index + 1}`)}
                    className={cn(
                      "w-full cursor-zoom-in object-contain transition-transform duration-200 group-hover:scale-[1.03]",
                      previews.length === 1 ? "max-h-[50dvh]" : "aspect-square",
                    )}
                  />
                  <span className="pointer-events-none absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">
                    <ZoomInIcon className="size-3.5" />
                    {t("拡大", "Zoom")}
                  </span>
                </button>
              ))}
            </div>
            {/* スマホでは画像が並んで長くなるので、ボタンを下に固定して横に並べる */}
            <AlertDialogFooter className="sticky bottom-0 -mx-6 -mb-6 grid grid-cols-2 gap-2 border-t bg-background px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:mb-0 sm:flex sm:border-0 sm:p-0">
              <AlertDialogCancel
                className="mt-0 h-11 sm:h-10"
                onClick={() => props.onClose(false)}
              >
                {t("修正する", "Fix")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="h-11 sm:h-10"
                onClick={() => props.onClose(true)}
              >
                {t("このまま投稿する", "Post as is")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
