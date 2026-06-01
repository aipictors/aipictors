import { CrownIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import {
  type AlbumWorkLimitPassType,
  FREE_ALBUM_WORKS_LIMIT,
  getAlbumWorksLimit,
  LITE_ALBUM_WORKS_LIMIT,
  STANDARD_ALBUM_WORKS_LIMIT,
} from "~/utils/album-work-limit"

type Props = {
  currentPassType: AlbumWorkLimitPassType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlbumWorkLimitUpgradeDialog(props: Props) {
  const t = useTranslation()
  const currentLimit = getAlbumWorksLimit(props.currentPassType)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CrownIcon className="size-5 text-amber-500" />
            {t("シリーズ作品数アップグレード", "Upgrade series work capacity")}
          </DialogTitle>
          <DialogDescription>
            {t(
              `現在の上限は${currentLimit}作品です。無料で${FREE_ALBUM_WORKS_LIMIT}作品、ライト以上で${LITE_ALBUM_WORKS_LIMIT}作品、スタンダード以上で${STANDARD_ALBUM_WORKS_LIMIT}作品まで追加できます。`,
              `Your current limit is ${currentLimit} works. Free users can add up to ${FREE_ALBUM_WORKS_LIMIT}, Lite or above up to ${LITE_ALBUM_WORKS_LIMIT}, and Standard or above up to ${STANDARD_ALBUM_WORKS_LIMIT}.`,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <p className="font-medium">
            {t(
              "シリーズをPart 2に分けずに、ひとつのシリーズへまとめて登録できます。",
              "Keep more works together in one series instead of splitting them into multiple parts.",
            )}
          </p>
          <p className="mt-2 text-muted-foreground">
            {t(
              "上限に達した場合はプランアップグレードで追加登録数を拡張できます。",
              "When you hit the limit, upgrading your plan expands how many works you can add.",
            )}
          </p>
        </div>

        <PlusAbout showUpgradePlansOnly={false} />
      </DialogContent>
    </Dialog>
  )
}
