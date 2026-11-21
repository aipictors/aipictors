import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { isValidUserLogin } from "~/utils/is-valid-user-login"

type Props = {
  currentLogin: string
  triggerChildren: React.ReactNode
}

/**
 * プロフィールの @ID の横から、その場でユーザー ID を変える
 * （以前は設定 > アカウント > ログイン情報 にしかなく、変えられるか聞かれていた）
 */
export function UserLoginEditDialog(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [login, setLogin] = useState(props.currentLogin)
  const [mutation, { loading }] = useMutation(updateLoginMutation)

  const nextLogin = login.trim().replace(/^@+/, "")
  const isChanged = nextLogin !== props.currentLogin
  const isValid = isValidUserLogin(nextLogin)

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) setLogin(props.currentLogin)
  }

  const onSave = async () => {
    if (!isValid || !isChanged) return
    try {
      await mutation({ variables: { input: { login: nextLogin } } })
      // トークンに入っている login を新しい ID にする
      await authContext.refresh()
      toast(t("ユーザー ID を変更しました", "User ID updated"))
      setIsOpen(false)
      navigate(`/users/${nextLogin}`, { replace: true })
    } catch (error) {
      toast(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t(
              "変更できませんでした。ほかの人が使っている ID かもしれません",
              "Could not change. The ID may already be taken.",
            ),
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("ユーザー ID を変更", "Change user ID")}</DialogTitle>
          <DialogDescription>
            {t(
              "@ のうしろの ID です。変えるとプロフィールの URL も変わり、前の URL は開けなくなります。",
              "The ID after @. Changing it also changes your profile URL; the old URL will stop working.",
            )}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSave()
          }}
        >
          <div
            className={cn(
              "flex h-11 items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring",
              !isValid && nextLogin !== "" && "border-destructive",
            )}
          >
            <span className="text-muted-foreground">@</span>
            <Input
              autoFocus
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-full border-0 px-1 shadow-none focus-visible:ring-0"
              aria-label={t("新しいユーザー ID", "New user ID")}
            />
          </div>
          <p
            className={cn(
              "text-xs leading-5",
              !isValid && nextLogin !== ""
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {t(
              "半角の英字を 1 文字以上含み、半角英数字と「_」「-」だけ使えます",
              "Must include a letter; only a-z, 0-9, _ and - are allowed",
            )}
          </p>
          {isChanged && isValid && (
            <p className="break-all rounded-md bg-muted px-3 py-2 text-xs">
              {t("新しい URL：", "New URL: ")}
              https://www.aipictors.com/users/{nextLogin}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              {t("キャンセル", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading || !isValid || !isChanged}>
              {loading && <Loader2Icon className="size-4 animate-spin" />}
              {t("変更する", "Change")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const updateLoginMutation = graphql(
  `mutation UpdateProfileLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }`,
)
