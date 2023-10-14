"use client"
import {
  Button,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Stack,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react"
import {
  PassType,
  useCreatePassCheckoutSessionMutation,
} from "__generated__/apollo"
import { PassPlanList } from "app/[lang]/(beta)/plus/components/PassPlanList"
import { PlusNoteList } from "app/[lang]/(beta)/plus/components/PlusNoteList"

export const PlusAbout: React.FC = () => {
  const [mutation, { loading: isLoading }] =
    useCreatePassCheckoutSessionMutation()

  const toast = useToast()

  const onSelect = async (passType: PassType) => {
    try {
      const result = await mutation({
        variables: { input: { passType: passType } },
      })
      const pageURL = result.data?.createPassCheckoutSession ?? null
      if (pageURL === null) {
        toast({
          status: "error",
          description: "セッションの作成に失敗しました。",
        })
        return
      }
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
  }

  return (
    <Stack spacing={8} pb={16}>
      <HStack
        justifyContent={"center"}
        fontSize={"xx-large"}
        fontWeight={"bold"}
      >
        <Text>{"Aipictors+"}</Text>
      </HStack>
      <Stack spacing={2}>
        <Text whiteSpace={"pre-wrap"}>
          {"Aipictors+に加入してサービス内で特典を受けることができます。"}
        </Text>
      </Stack>
      <PassPlanList onSelect={onSelect} isLoading={isLoading} />
      <Stack spacing={2}>
        <Text fontWeight={"bold"} fontSize={"lg"}>
          {"注意事項"}
        </Text>
        <PlusNoteList />
      </Stack>
    </Stack>
  )
}
