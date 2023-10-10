"use client"
import { Button, Card, HStack, Image, Input, Stack } from "@chakra-ui/react"
import { useState } from "react"
import type { FormLogin } from "app/types/formLogin"

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
    <Card variant={"unstyled"} w={"100%"} maxW={"xs"} borderRadius={"lg"}>
      <Stack spacing={8} p={0}>
        <HStack justifyContent={"center"}>
          <Image alt={"Logo"} src={"/icon.png"} maxW={"4rem"} />
        </HStack>
        <Stack spacing={4}>
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
        </Stack>
        <Button isLoading={props.isLoading} lineHeight={1} onClick={onLogin}>
          {"ログイン"}
        </Button>
      </Stack>
    </Card>
  )
}
