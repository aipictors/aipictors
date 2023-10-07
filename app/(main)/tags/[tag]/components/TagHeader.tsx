"use client"
import {
  Button,
  HStack,
  Stack,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { SearchSettingModal } from "app/(main)/tags/[tag]/components/SearchSettingModal"

export const TagHeader: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Stack spacing={4}>
        <HStack justifyContent={"center"}>
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {"＃タグの検索結果（1234件）"}
          </Text>
        </HStack>
        <HStack>
          <Text>{"検索トップ"}</Text>
          <Text fontSize={"sm"}>{">検索結果"}</Text>
        </HStack>
        <HStack>
          <Button colorScheme="primary" borderRadius={"full"} onClick={onOpen}>
            {"詳細検索設定"}
          </Button>
        </HStack>
        <HStack>
          <Text>{"ぼかしを外す"}</Text>
          <Switch />
          <Text>{"ダイアログ"}</Text>
          <Switch />
        </HStack>
      </Stack>
      <SearchSettingModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
