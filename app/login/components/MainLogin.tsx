"use client"
import { HStack, useToast } from "@chakra-ui/react"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { useRouter } from "next/navigation"
import { FC, useContext } from "react"
import { useLoginWithPasswordMutation } from "__generated__/apollo"
import { MainLoading } from "app/components/MainLoading"
import { BoxFormLogin } from "app/login/components/BoxFormLogin"
import { FormLogin } from "app/login/types/formLogin"
import { AppContext } from "contexts/appContext"

type Props = {}

export const MainLogin: FC<Props> = () => {
  const context = useContext(AppContext)

  const router = useRouter()

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
      router.replace("/home")
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
  }

  if (context.isLoading) {
    return <MainLoading />
  }

  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <BoxFormLogin onSubmit={onLogin} isLoading={isLoading} />
    </HStack>
  )
}
