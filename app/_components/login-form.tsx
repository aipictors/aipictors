"use client"

import type { FormLogin } from "@/app/_types/form-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useState } from "react"

type Props = {
  onSubmit(form: FormLogin): void
  isLoading: boolean
}

export const LoginForm = (props: Props) => {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <div className="space-y-2 w-full">
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <span>{"ログイン"}</span>
        )}
      </Button>
    </div>
  )
}
