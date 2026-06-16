import { Heart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  thankYouMessage: string
  targetUserIconUrl?: string | null
  targetUserName?: string
  totalPt?: number
}

export function SupportSuccessDialog(props: Props) {
  const t = useTranslation()

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-sm overflow-hidden rounded-3xl border-0 bg-gradient-to-b from-rose-50 via-white to-orange-50 p-0 shadow-2xl">
        <div className="px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <DialogTitle className="pt-3 text-center text-lg">
              {t("推しが完了しました", "Support sent")}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            {props.totalPt !== undefined && (
              <div className="mx-auto w-fit rounded-full bg-rose-500 px-3 py-1 font-semibold text-sm text-white">
                +{props.totalPt}pt
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white">
                {props.targetUserIconUrl ? (
                  <img
                    src={props.targetUserIconUrl}
                    alt={props.targetUserName ?? "user"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Heart className="h-5 w-5 text-rose-400" />
                )}
              </div>

              <div className="relative flex-1 rounded-2xl bg-white px-4 py-3 text-sm leading-6 shadow-sm ring-1 ring-rose-100">
                <div className="absolute top-4 -left-2 h-3 w-3 rotate-45 bg-white ring-1 ring-rose-100" />
                <p className="relative z-10 whitespace-pre-wrap text-foreground">
                  {props.thankYouMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}