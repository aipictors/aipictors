"use client"
import {
  Button,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { CardTitleWorkList } from "app/[lang]/(main)/viewer/albums/components/CardTitleWorkList"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const ViewerAlbumAddModal: React.FC<Props> = (props) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      scrollBehavior="inside"
      size={"xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalCloseButton />
        <ModalBody>
          <HStack justifyContent={"center"}>
            <Stack spacing={6}>
              <HStack justifyContent={"center"}>
                <Text>{"シリーズ新規作成"}</Text>
              </HStack>
              <Stack>
                <Text>{"サムネイル画像:32MB以内 PNG、JPEG対象"}</Text>
                <Button
                  p={0}
                  h={"auto"}
                  overflow={"hidden"}
                  variant={"outline"}
                  borderWidth={2}
                >
                  <Image
                    src="https://source.unsplash.com/random/800x600"
                    alt=""
                    boxSize={"sm"}
                  />
                </Button>
              </Stack>
              <Stack>
                <Text>{"シリーズ名"}</Text>
                <Input placeholder="シリーズ名" />
                <Text>{"リンク名（英数字のみ）"}</Text>
                <Input placeholder="リンク名" />
                <Text
                  fontSize={"xs"}
                >{`https://aipictors.com/series?user=36604&id=${""}`}</Text>
                <Text>{"説明"}</Text>
                <Textarea placeholder="説明" />
              </Stack>
              <Stack>
                <Text>{"シリーズ名"}</Text>
                <RadioGroup defaultValue="1">
                  <HStack>
                    <Radio value="1">{"全年齢"}</Radio>
                    <Radio value="2">{"性的描写あり"}</Radio>
                    <Radio value="3">{"R-18"}</Radio>
                    <Radio value="4">{"R-18G"}</Radio>
                  </HStack>
                </RadioGroup>
              </Stack>
              <Stack>
                <Text>{"投稿済み作品一覧"}</Text>
                <CardTitleWorkList />
              </Stack>
              <Stack>
                <Text>{"選択済み作品一覧"}</Text>
                <CardTitleWorkList />
              </Stack>
              <HStack justifyContent={"center"}>
                <Button
                  colorScheme="primary"
                  borderRadius={"full"}
                  onClick={() => {
                    alert("投稿しました")
                    props.onClose()
                  }}
                >
                  {"保存"}
                </Button>
              </HStack>
            </Stack>
          </HStack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
