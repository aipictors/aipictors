"use client"
import {
  Button,
  HStack,
  Stack,
  Text,
  ListItem,
  UnorderedList,
  OrderedList,
  Link,
  useToast,
} from "@chakra-ui/react"
import { FC } from "react"
import { useCreatePassCheckoutUrlMutation } from "__generated__/apollo"

export const MainPlusAbout: FC = () => {
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
      <Stack spacing={8} maxW={"lg"} px={6}>
        <HStack
          justifyContent={"center"}
          fontSize={"xx-large"}
          fontWeight={"bold"}
        >
          <Text>{"Aipictors+"}</Text>
        </HStack>
        <Stack spacing={2}>
          <Text whiteSpace={"pre-wrap"}>
            {
              "Aipictors+になることでサービス内で特典*を受けることができるようになります。\n料金は2000円/月となります。"
            }
          </Text>
        </Stack>
        <Stack spacing={2}>
          <Text fontWeight={"bold"} fontSize={"lg"}>
            {"特典"}
          </Text>
          <UnorderedList spacing={2}>
            <ListItem>{"サービス内の広告をすべて非表示"}</ListItem>
            <ListItem>{"1ヶ月につき無料分とあわせ最大3,000枚（1日あたり生成枚数 100枚へ 上限アップ）"}</ListItem>
            <ListItem>{"生成速度アップ（生成優先）"}</ListItem>
            <ListItem>{"認証マーク付与"}</ListItem>
          </UnorderedList>
          <Text>
            {
              "本プランは何らかの理由により内容を追加、又は廃止する場合があります。"
            }
          </Text>
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
          <Text fontWeight={"bold"} fontSize={"lg"}>
            {"注意事項"}
          </Text>
          <OrderedList spacing={2}>
            <ListItem>
              {
                "本プランの加入期間は、加入日から翌月同日までの1か月間となります。加入期間満了日までにお客様が自ら解約しない限り、本プランの加入期間は翌日から同一期間更新したものとみなし、以後同様とします。"
              }
            </ListItem>
            <ListItem>
              {
                "お客様は当社指定方法に基づき申し出ることで、いつでも本プランを解約することができます。"
              }
            </ListItem>
            <ListItem>
              {
                "解約を申し出る場合は、解約手続きの完了日以降に到来する加入期間満了日をもって、本プランは終了します。"
              }
            </ListItem>
            <ListItem>
              {
                "加入期間の途中で、本料金の金額が変更される場合があっても、本料金の日割り計算は行いません。"
              }
            </ListItem>
            <ListItem>
              {
                "お客様は本プランの解約を申し出た場合は、これを撤回または取り消すことはできません。"
              }
            </ListItem>
            <ListItem>
              {"本プランの特典は加入期間を過ぎると全て無効となります。"}
            </ListItem>
            <ListItem>
              {
                "生成サービスの提供はベストエフォートです。待ち時間により上限まで生成することに時間がかかることがあります。"
              }
            </ListItem>
            <ListItem>
              {
                "システム障害などが発生した場合でも返金や期間の延長は原則行うことができません。予めご了承下さい。"
              }
            </ListItem>
            <ListItem>
              {
                "プロンプトの指定が適切でなく意図した画像が生成できない、StableDiffusion側での生成がうまくいかず真っ黒画像が生成されるなど、生成処理を実行したものの、生成がうまくいかないケースについてはエラーとはみなしません。利用者側で工夫してご対応下さい。"
              }
            </ListItem>
            <ListItem>
              {
                "規約違反の利用をした場合、生成機能の利用は禁止いたします。その場合も返金対応等は一切行いません。"
              }
            </ListItem>
            <ListItem>
              {
                "本プランは何らかの理由により内容を変更し、又は廃止する場合があります。変更後の内容がお客様の権利関係に重大な影響を与える場合又は本プランを廃止する場合は事前に通知、お知らせいたします。緊急性がある場合又はやむをえない場合は事後的に通知いたします。"
              }
            </ListItem>
            <ListItem>
              {
                "本プランに関し、規約違反に反する行為又は該当する恐れのある行為が確認された場合は特典を停止することがあります。AIイラスト生成で規約違反が発覚した場合はAIイラスト生成機能の停止となる場合がございます。詳細は当サービスの規約（"
              }
              <Link href={"https://www.aipictors.com/terms"} isExternal>
                {"https://www.aipictors.com/terms"}
              </Link>
              {"）をご確認下さい。"}
            </ListItem>
          </OrderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}
