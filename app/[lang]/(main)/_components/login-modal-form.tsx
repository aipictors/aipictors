"use client"

import type { FormLogin } from "@/app/_types/form-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { TbX } from "react-icons/tb"

type Props = {
  onSubmit(form: FormLogin): void
  onClose(): void
  isLoading: boolean
}

export const LoginModalForm = (props: Props) => {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <div className="p-4">
      <div className="space-y-8 p-0">
        <div className="space-y-0">
          <div className="flex justify-end">
            <Button aria-label={"削除"} size={"icon"} onClick={props.onClose}>
              <TbX />
            </Button>
          </div>
          <div className="flex justify-center">
            <img alt="Logo" src="/icon.png" className="max-w-16" />
          </div>
        </div>
        <div className="space-y-4">
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
          <Button disabled={props.isLoading} onClick={onLogin}>
            {"ログイン"}
          </Button>
        </div>
      </div>
    </div>
  )
}
