import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import type { FormLogin } from "@/_types/form-login"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

type Props = {
  onSubmit(form: FormLogin): void
  isLoading: boolean
}

export const PasswordLoginForm = (props: Props) => {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <div className="w-full space-y-2">
      <Input
        disabled={props.isLoading}
        placeholder={"ユーザID"}
        value={username}
        onChange={(event) => {
          setUsername(event.target.value)
        }}
      />
      <Input
        disabled={props.isLoading}
        placeholder={"パスワード"}
        type={"password"}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
        }}
      />
      <Button onClick={onLogin} className="w-full">
        {props.isLoading ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <span>{"ログイン"}</span>
        )}
      </Button>
    </div>
  )
}
