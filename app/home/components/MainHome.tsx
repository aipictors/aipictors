"use client"
import { HStack, Text } from "@chakra-ui/react"
import { FC, useContext } from "react"
import { MainLoading } from "app/components/MainLoading"
import { MainLogin } from "app/login/components/MainLogin"
import { AppContext } from "contexts/appContext"

type Props = {}

export const MainHome: FC<Props> = (props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <MainLoading />
  }

  console.log(context)

  if (context.isNotLoggedIn) {
    return <MainLogin />
  }

  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Text>{"ログイン済み"}</Text>
    </HStack>
  )
}
