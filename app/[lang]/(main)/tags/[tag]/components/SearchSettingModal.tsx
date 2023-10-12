"use client"
import {
  Button,
  Divider,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import { TbCheck } from "react-icons/tb"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const SearchSettingModal: React.FC<Props> = (props) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"詳細検索設定"}</ModalHeader>
        <ModalCloseButton onClick={props.onClose} />
        <ModalBody>
          <Stack spacing={4}>
            <HStack>
              <Text>{"年齢制限："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"作品形式："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"検索対象："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"使用AI："}</Text>
              <Input placeholder={"タグ名"} maxW={"lg"} />
            </HStack>
            <Divider />
            <HStack>
              <Text>{"使用モデル："}</Text>
              <Input placeholder={"タグ名"} maxW={"lg"} />
            </HStack>
            <Divider />
            <HStack>
              <Text>{"使用サービス："}</Text>
              <Input placeholder={"タグ名"} maxW={"lg"} />
            </HStack>
            <Divider />
            <HStack>
              <Text>{"プロンプト公開："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"フォロー関係："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"お題参加："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"テイスト："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"投稿日："}</Text>
              <Text>{"開始日："}</Text>
              <Input
                placeholder="Select Date and Time"
                size="md"
                type="datetime-local"
              />
              <Text>{"終了日："}</Text>
              <Input
                placeholder="Select Date and Time"
                size="md"
                type="datetime-local"
              />
            </HStack>
            <Divider />
            <HStack>
              <Text>{"表示順："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
            <HStack>
              <Text>{"投稿件数："}</Text>
              <Button
                leftIcon={<Icon as={TbCheck} />}
                borderRadius={"full"}
                size={"xs"}
              >
                {"全年齢"}
              </Button>
            </HStack>
            <Divider />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button borderRadius={"full"} colorScheme="primary">
            {"検索"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
