"use client"
import { Divider, HStack, Stack, useToast, Text } from "@chakra-ui/react"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { useLoginWithPasswordMutation } from "__generated__/apollo"
import { BoxFormLogin } from "app/components/BoxFormLogin"
import type { FormLogin } from "app/types/formLogin"

export const MainLogin: React.FC = () => {
  const [mutation, { loading: isLoading }] = useLoginWithPasswordMutation()

  const toast = useToast()

  const onLogin = async (form: FormLogin) => {
    try {
      const result = await mutation({
        variables: {
          input: {
            login: form.login,
            password: form.password,
          },
        },
      })
      const token = result.data?.loginWithPassword.token ?? null
      if (token === null) {
        toast({ status: "error", description: "ログインに失敗しました。" })
        return
      }
      await signInWithCustomToken(getAuth(), token)
      toast({ status: "success", description: "ログインしました。" })
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
  }

  return (
    <HStack justifyContent={"center"} py={16} w={"100%"}>
      <Stack
        justifyContent={"center"}
        alignItems={"center"}
        maxW={"sm"}
        spacing={6}
      >
        <BoxFormLogin onSubmit={onLogin} isLoading={isLoading} />
        <Divider />

        <Text>
          {
            "現在、アプリでのログインはパスワード認証のみに対応しています。パスワードはサイトから設定または変更できます。"
          }
        </Text>
      </Stack>
    </HStack>
  )
}
