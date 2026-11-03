import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import type { FormLogin } from "~/types/form-login"

type Props = {
  onSubmit(form: FormLogin): void
  isLoading: boolean
}

export function PasswordLoginForm(props: Props): React.ReactNode {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const t = useTranslation()

  const userId = useId()
  const passwordId = useId()

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !props.isLoading

  return (
    <form
      className="w-full space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        props.onSubmit({ login: username.trim(), password: password })
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor={userId} className="font-medium text-xs">
          {t("ユーザーID", "User ID")}
        </label>
        <Input
          id={userId}
          className="h-12 rounded-xl text-base md:text-sm"
          disabled={props.isLoading}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
          }}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="font-medium text-xs">
          {t("パスワード", "Password")}
        </label>
        <div className="relative">
          <Input
            id={passwordId}
            className="h-12 rounded-xl pr-12 text-base md:text-sm"
            disabled={props.isLoading}
            autoComplete="current-password"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
            }}
          />
          <button
            type="button"
            aria-label={
              isPasswordVisible
                ? t("パスワードを隠す", "Hide password")
                : t("パスワードを表示", "Show password")
            }
            onClick={() => setIsPasswordVisible((value) => !value)}
            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {isPasswordVisible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-12 w-full rounded-xl font-semibold"
      >
        {props.isLoading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          t("ログイン", "Log in")
        )}
      </Button>
    </form>
  )
}
