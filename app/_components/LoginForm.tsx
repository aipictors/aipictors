"use client"
import { Button, Input, Stack } from "@chakra-ui/react"
import type { FormLogin } from "app/_types/formLogin"
import { useState } from "react"

type Props = {
  onSubmit(form: FormLogin): void
  isLoading: boolean
}

export const LoginForm: React.FC<Props> = (props) => {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <Stack spacing={4} p={0} w={"100%"}>
      <Input
        isDisabled={props.isLoading}
        placeholder={"ユーザID"}
        variant={"filled"}
        value={username}
        onChange={(event) => {
          setUsername(event.target.value)
        }}
      />
      <Input
        isDisabled={props.isLoading}
        placeholder={"パスワード"}
        variant={"filled"}
        type={"password"}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
        }}
      />
      <Button isLoading={props.isLoading} lineHeight={1} onClick={onLogin}>
        {"ログイン"}
      </Button>
    </Stack>
  )
}
