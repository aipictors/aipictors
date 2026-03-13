import { Clock3 } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchRateLimitDialog(props: Props): React.ReactNode {
  const t = useTranslation()

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-orange-500" />
            {t("検索制限", "Search limit")}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p>
                {t(
                  "次回メンテナンスまでは1分に3回までしか検索できません。",
                  "Until the next maintenance, searches are limited to 3 times per minute.",
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                {t(
                  "少し時間をおいてから、もう一度お試しください。",
                  "Please wait a moment before trying again.",
                )}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => props.onOpenChange(false)}>
            {t("閉じる", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
