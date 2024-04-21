import { LoginDialogContent } from "@/_components/login-dialog-content"
import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { cn } from "@/_lib/utils"
import { LoaderIcon } from "lucide-react"

type Props = {
  label?: string
  isWidthFull?: boolean
  triggerChildren?: React.ReactNode
  isLoading?: boolean
  description?: string
  imageUrl?: string
}

/**
 * ログイン
 * @param props
 * @returns
 */
export function LoginDialogButton(props: Props) {
  return (
    <Dialog>
      <DialogTrigger disabled={props.isLoading} asChild>
        {props.triggerChildren ? (
          props.triggerChildren
        ) : (
          <Button
            disabled={props.isLoading}
            className={cn(props.isWidthFull ? "w-full" : "")}
          >
            {props.label ? props.label : "ログイン"}
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
          <DialogTitle>{"ログイン"}</DialogTitle>
          <DialogDescription>
            {props.imageUrl && <img alt="補足" src={props.imageUrl} />}
            {props.description || "ここから先はログインが必要みたい。"}
          </DialogDescription>
        </DialogHeader>
        <LoginDialogContent />
      </DialogContent>
    </Dialog>
  )
}
