"use client"
import { HStack, Text } from "@chakra-ui/react"
import { useContext } from "react"
import { MainLoading } from "app/components/MainLoading"
import { MainLogin } from "app/components/MainLogin"
import { AppContext } from "app/contexts/appContext"

export const MainHome: React.FC = () => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <MainLoading />
  }

  if (context.isNotLoggedIn) {
    return <MainLogin />
  }

  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Text>{"ログイン済み"}</Text>
    </HStack>
  )
}
