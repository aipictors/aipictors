import { Link } from "@remix-run/react"
import { CircleHelp } from "lucide-react"
import { CoinHelpContent } from "~/components/coin-help-content"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  triggerLabel?: string
}

export function CoinHelpDialog (props: Props) {
  const t = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" />
          <span>
            {props.triggerLabel ??
              t("コイン・pt・推しとは", "About coins, pt and support")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("コイン・pt・推しとは", "About coins, pt and support")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "コインの種類、pt の計算、ランキングや使い道をまとめて確認できます。",
              "Review coin types, pt calculation, rankings, and use cases in one place.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <CoinHelpContent compact />
        </div>
        <div className="pt-2 text-right text-sm">
          <Link className="underline underline-offset-4" to="/help?tab=coins">
            {t("/help の詳しいガイドを見る", "Open the detailed guide on /help")}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}