"use client"

import {
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Stack,
} from "@chakra-ui/react"
import type { FormLogin } from "app/_types/formLogin"
import { useState } from "react"
import { TbX } from "react-icons/tb"

type Props = {
  onSubmit(form: FormLogin): void
  onClose(): void
  isLoading: boolean
}

export const LoginModalForm: React.FC<Props> = (props) => {
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")

  const onLogin = () => {
    props.onSubmit({ login: username, password: password })
  }

  return (
    <Stack p={4}>
      <Stack spacing={8} p={0}>
        <Stack spacing={0}>
          <HStack justifyContent={"flex-end"}>
            <IconButton
              aria-label={"削除"}
              borderRadius={"full"}
              icon={<Icon as={TbX} />}
              onClick={props.onClose}
            />
          </HStack>
          <HStack justifyContent={"center"}>
            <Image alt={"Logo"} src={"/icon.png"} maxW={"4rem"} />
          </HStack>
        </Stack>
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
          <Button isLoading={props.isLoading} lineHeight={1} onClick={onLogin}>
            {"ログイン"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
