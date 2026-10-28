import { Slot } from "@radix-ui/react-slot"
import { LoaderIcon } from "lucide-react"
import { useState } from "react"
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
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  label?: string
  className?: string
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
 * ダイアログは最初に押されたときに作る（一覧のいいねボタンなど、1 ページに数十個並ぶと
 * 未ログインの表示でダイアログの部品が数十組できて、表示後の処理が重くなっていた）
 */
export function LoginDialogButton(props: Props): React.ReactNode {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  const trigger = props.triggerChildren ? (
    props.triggerChildren
  ) : (
    <Button
      variant={props.variant}
      disabled={props.isLoading}
      className={cn(props.isWidthFull ? "w-full" : "", props.className)}
    >
      {props.label ? props.label : t("ログイン", "Login")}
      {props.isLoading && (
        <span className="ml-2 animate-spin">
          <LoaderIcon />
        </span>
      )}
    </Button>
  )

  if (!hasOpened) {
    return (
      <Slot
        onClick={(event: React.MouseEvent) => {
          if (props.isLoading) return
          event.preventDefault()
          event.stopPropagation()
          setHasOpened(true)
          setIsOpen(true)
        }}
      >
        {trigger}
      </Slot>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger disabled={props.isLoading} asChild>
        {trigger}
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
