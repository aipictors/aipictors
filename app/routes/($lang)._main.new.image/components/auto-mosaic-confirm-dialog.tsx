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

type Props = {
  /** 自動でモザイクをかけた画像（かけた後）。null なら閉じている */
  previews: string[] | null
  /** true: このまま投稿する、false: 戻って直す */
  onClose: (isConfirmed: boolean) => void
}

/**
 * 投稿の直前に、自動でかけたモザイクを確かめてもらう
 * 自動の検出は誤ることがある（かけすぎ・足りない）ので、直してから投稿できるようにする
 */
export function AutoMosaicConfirmDialog(props: Props) {
  const t = useTranslation()
  const previews = props.previews ?? []

  return (
    <AlertDialog
      open={props.previews !== null}
      onOpenChange={(open) => {
        if (!open) props.onClose(false)
      }}
    >
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t(
              "自動でかけたモザイクを確認してください",
              "Please check the automatic mosaic",
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              `${previews.length}枚に自動でモザイクをかけました。自動の検出は誤ることがあります。必要のない所にかかっている・足りない所がある場合は、「修正する」から各画像の鉛筆ボタンで範囲を直してください。`,
              `An automatic mosaic was applied to ${previews.length} image(s). Automatic detection can be wrong. If it covers areas that don't need it or misses areas, choose "Fix" and adjust each image with the pencil button.`,
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <img
              // 同じ画像が並ぶこともあるので順番も使う
              key={`${index}-${preview.slice(-32)}`}
              src={preview}
              alt={t(`${index + 1}枚目`, `Image ${index + 1}`)}
              className="aspect-square w-full rounded-md bg-black/40 object-contain"
            />
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => props.onClose(false)}>
            {t("修正する", "Fix")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => props.onClose(true)}>
            {t("このまま投稿する", "Post as is")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
