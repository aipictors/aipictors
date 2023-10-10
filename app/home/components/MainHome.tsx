"use client"
import { HStack, Text } from "@chakra-ui/react"
import { useContext } from "react"
import { LoadingPage } from "app/components/LoadingPage"
import { LoginPage } from "app/components/LoginPage"
import { AppContext } from "app/contexts/appContext"

export const MainHome: React.FC = () => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <LoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Text>{"ログイン済み"}</Text>
    </HStack>
  )
}
