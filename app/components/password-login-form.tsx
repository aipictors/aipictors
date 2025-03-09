import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type { FormLogin } from "~/types/form-login"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onSubmit(form: FormLogin): void
  isLoading: boolean
}

export function PasswordLoginForm(props: Props) {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const t = useTranslation()

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <div className="w-full space-y-2">
      <Input
        disabled={props.isLoading}
        placeholder={t("ユーザID", "User ID")}
        value={username}
        onChange={(event) => {
          setUsername(event.target.value)
        }}
      />
      <Input
        disabled={props.isLoading}
        placeholder={t("パスワード", "Password")}
        type={"password"}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
        }}
      />
      <Button onClick={onLogin} className="w-full">
        {props.isLoading ? (
          <Loader2Icon className="mr-2 size-4 animate-spin" />
        ) : (
          <span>{t("ログイン", "Login")}</span>
        )}
      </Button>
    </div>
  )
}
