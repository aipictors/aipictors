"use client"
import { Button, HStack, useToast } from "@chakra-ui/react"
import { FC } from "react"
import { useCreatePassCheckoutUrlMutation } from "__generated__/apollo"

export const MainPlus: FC = () => {
  const [mutation, { loading: isLoading }] = useCreatePassCheckoutUrlMutation()

  const toast = useToast()

  const onPay = async () => {
    try {
      const result = await mutation({ variables: {} })
      const url = result.data?.createPassCheckoutURL ?? null
      if (url === null) {
        toast({ status: "error", description: "決済URLの取得に失敗しました。" })
        return
      }
      window.location.assign(url)
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
  }

  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Button onClick={onPay} lineHeight={1} isLoading={isLoading}>
        {"決済に進む"}
      </Button>
    </HStack>
  )
}
