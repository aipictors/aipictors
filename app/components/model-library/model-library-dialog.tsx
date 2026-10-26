import {
  ModelLibrary,
  type ModelLibraryProps,
} from "~/components/model-library/model-library"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"

type Props = Omit<ModelLibraryProps, "variant"> & {
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
}

/**
 * モデルライブラリのダイアログ（生成画面から遅延読み込みする）
 */
export default function ModelLibraryDialog(props: Props) {
  const { isOpen, onOpenChange, ...libraryProps } = props

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0 flex h-[100dvh] max-h-none w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:h-[min(880px,calc(100dvh-3rem))] sm:w-[min(1240px,calc(100vw-3rem))] sm:max-w-none sm:rounded-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="shrink-0 px-4 pt-4 pr-14 pb-1 md:sr-only">
          <DialogTitle className="font-bold text-base">
            モデルライブラリ
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          公式モデル・みんなのモデル・自分のモデルから選んで生成に使えます
        </DialogDescription>
        <div className="min-h-0 flex-1">
          <ModelLibrary variant="dialog" {...libraryProps} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
