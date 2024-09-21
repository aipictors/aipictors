import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  children: React.ReactNode
  isShowControlNetCaption: boolean
  onReference(): void
  onReferenceWithSeed(): void
}

/**
 * 参照生成ダイアログ
 */
export function GenerationReferenceDialog(props: Props) {
  const t = useTranslation()

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("復元", "Restore")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              onClick={props.onReference}
              variant={"secondary"}
              size={"sm"}
            >
              {t("再利用", "Reuse")}
            </Button>
            <Button
              onClick={props.onReferenceWithSeed}
              variant={"secondary"}
              size={"sm"}
            >
              {t("再利用（Seed込み）", "Reuse (with Seed)")}
            </Button>
          </div>
          {props.isShowControlNetCaption && (
            <div className="mt-2">
              <p className="text-gray-500 text-sm">
                {t(
                  "※ControlNetの設定は復元されません。",
                  "※ControlNet settings will not be restored.",
                )}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose>
              <Button>{t("閉じる", "Close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
