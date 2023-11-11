"use client"

import { useSuspenseQuery } from "@apollo/client"
import {
  Button,
  Card,
  Divider,
  HStack,
  Stack,
  Tag,
  Text,
  useToast,
} from "@chakra-ui/react"
import type {
  ViewerCurrentPassQuery,
  ViewerCurrentPassQueryVariables,
} from "__generated__/apollo"
import {
  ViewerCurrentPassDocument,
  useCreateCustomerPortalSessionMutation,
} from "__generated__/apollo"
import { PassBenefitList } from "app/[lang]/(beta)/plus/_components/PassBenefitList"
import { PassImageGenerationBenefitList } from "app/[lang]/(beta)/plus/_components/PassImageGenerationBenefitList"
import { PlusAbout } from "app/[lang]/(beta)/plus/_components/PlusAbout"
import { PlusNoteList } from "app/[lang]/(beta)/plus/_components/PlusNoteList"
import { toPassName } from "app/[lang]/(beta)/plus/_utils/toPassName"
import { toDateText } from "app/_utils/toDateText"

export const PlusForm: React.FC = () => {
  const [mutation, { loading: isLoading }] =
    useCreateCustomerPortalSessionMutation()

  const { data } = useSuspenseQuery<
    ViewerCurrentPassQuery,
    ViewerCurrentPassQueryVariables
  >(ViewerCurrentPassDocument, {})

  const toast = useToast()

  const onOpenCustomerPortal = async () => {
    try {
      const result = await mutation({})
      const pageURL = result.data?.createCustomerPortalSession ?? null
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

  console.log("data", data)

  if (data.viewer === null) {
    return null
  }

  if (data.viewer.currentPass === null) {
    return <PlusAbout />
  }

  const currentPass = data.viewer.currentPass

  const nextDateText = toDateText(currentPass.periodEnd)

  const currentPassName = toPassName(currentPass.type)

  return (
    <Stack spacing={8} pb={16}>
      <HStack
        justifyContent={"center"}
        fontSize={"xx-large"}
        fontWeight={"bold"}
      >
        <Text>{"Aipictors+"}</Text>
      </HStack>
      <Stack
        spacing={{ base: 4, md: 8 }}
        direction={{ base: "column", md: "row-reverse" }}
        justifyContent={"space-between"}
      >
        <Stack spacing={4} flex={1}>
          <Text>{`現在、あなたは「${currentPassName}」をご利用中です。`}</Text>
          <Stack>
            <HStack>
              <Tag>{"次回の請求日"}</Tag>
              <Text>{nextDateText}</Text>
            </HStack>
            <HStack>
              <Tag>{"次回の請求額"}</Tag>
              <Text>{`${currentPass.price}円（税込）`}</Text>
            </HStack>
          </Stack>
          <Text>
            {
              "決済方法の変更やプランのキャンセル及び変更はこちらのリンクから行えます。"
            }
          </Text>
          <Button
            colorScheme={"green"}
            onClick={onOpenCustomerPortal}
            isLoading={isLoading}
          >
            {"プランをキャンセルまたは変更する"}
          </Button>
        </Stack>
        <Card variant={"filled"} flex={1}>
          <Stack p={4} spacing={2}>
            <HStack justifyContent={"space-between"}>
              <Text fontWeight={"bold"} fontSize={{ base: "md", sm: "xl" }}>
                {`${currentPassName}の特典`}
              </Text>
            </HStack>
            <Divider />
            <PassBenefitList passType={currentPass.type} />
            <Divider />
            <Text fontSize={"sm"} opacity={0.6} fontWeight={"bold"}>
              {"画像生成の特典"}
            </Text>
            <PassImageGenerationBenefitList passType={currentPass.type} />
            <Divider />
            <Text fontSize={"xs"}>
              {
                "本プランは何らかの理由により内容を追加、又は廃止する場合があります。"
              }
            </Text>
          </Stack>
        </Card>
      </Stack>
      <Stack>
        <Text>
          {"この度はAipictorsをご利用いただき、誠にありがとうございます。"}
        </Text>
      </Stack>
      <Stack spacing={2}>
        <Text fontWeight={"bold"} fontSize={"lg"}>
          {"注意事項"}
        </Text>
        <PlusNoteList />
      </Stack>
    </Stack>
  )
}
