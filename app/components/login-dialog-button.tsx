import { LoginDialogContent } from "~/components/login-dialog-content"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  label?: string
  isWidthFull?: boolean
  triggerChildren?: React.ReactNode
  isLoading?: boolean
  description?: string
  imageUrl?: string
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
}

/**
 * ログイン
 */
export function LoginDialogButton(props: Props) {
  const t = useTranslation()

  return (
    <Dialog>
      <DialogTrigger disabled={props.isLoading} asChild>
        {props.triggerChildren ? (
          props.triggerChildren
        ) : (
          <Button
            variant={props.variant}
            disabled={props.isLoading}
            className={cn(props.isWidthFull ? "w-full" : "")}
          >
            {props.label ? props.label : t("ログイン", "Login")}
            {props.isLoading && (
              <span className="ml-2 animate-spin">
                <LoaderIcon />
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ログイン", "Login")}</DialogTitle>
          <DialogDescription>
            {props.imageUrl && (
              <img alt={t("補足", "Supplementary")} src={props.imageUrl} />
            )}
            {props.description ||
              t(
                "ここから先はログインが必要みたい。",
                "It seems you need to log in to proceed.",
              )}
          </DialogDescription>
        </DialogHeader>
        <LoginDialogContent />
      </DialogContent>
    </Dialog>
  )
}
