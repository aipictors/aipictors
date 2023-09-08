"use client"
import { Button, HStack, Stack, useToast, Text } from "@chakra-ui/react"
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
    <Stack py={16} minH={"100vh"} alignItems={"center"}>
      <Stack spacing={8} maxW={"sm"} px={6}>
        <HStack
          justifyContent={"center"}
          fontSize={"xx-large"}
          fontWeight={"bold"}
        >
          <Text>{"サブスク"}</Text>
        </HStack>
        <Text>
          {
            "ここにテキストが入ります。ここにテキストが入ります。ここにテキストが入ります。ここにテキストが入ります。ここにテキストが入ります。"
          }
        </Text>
        <Stack spacing={2}>
          <Text fontWeight={"bold"}>{"サブスクの特徴"}</Text>
          <Text>{"ここにテキストが入ります。ここにテキストが入ります。"}</Text>
        </Stack>
        <Button
          colorScheme={"green"}
          onClick={onPay}
          lineHeight={1}
          isLoading={isLoading}
        >
          {"決済に進む"}
        </Button>
        <Stack spacing={2}>
          <Text fontWeight={"bold"}>{"注意事項"}</Text>
          <Text>{"ここにテキストが入ります。ここにテキストが入ります。"}</Text>
        </Stack>
      </Stack>
    </Stack>
  )
}
