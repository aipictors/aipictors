import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"

/**
 * ログイン
 * @returns
 */
export function LoginDialogButton() {
  return (
    <DialogTrigger asChild>
      <Button>{"ログイン"}</Button>
    </DialogTrigger>
  )
}
