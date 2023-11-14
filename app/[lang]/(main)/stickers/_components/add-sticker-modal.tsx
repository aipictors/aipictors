"use client"

import {
  Button,
  Checkbox,
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
  Stack,
  Text,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const AddStickerModal = (props: Props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      isCentered
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"スタンプ公開"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <Text>{"非公開の作成済みスタンプ"}</Text>
            <HStack>
              <Image
                boxSize={36}
                src="gibbresh.png"
                fallbackSrc="https://via.placeholder.com/150"
              />
              <Image
                boxSize={36}
                src="gibbresh.png"
                fallbackSrc="https://via.placeholder.com/150"
              />
            </HStack>
            <Text>{"選択スタンプ"}</Text>
            <Image
              boxSize={36}
              src="gibbresh.png"
              fallbackSrc="https://via.placeholder.com/150"
            />
            <Text>{"タイトル"}</Text>
            <Input placeholder="タイトル" />
            <Stack>
              <Text>{"ジャンル"}</Text>
              <HStack spacing={4}>
                <Checkbox size="sm" colorScheme="blue">
                  {"人物"}
                </Checkbox>
                <Checkbox size="sm" colorScheme="blue">
                  {"動物"}
                </Checkbox>
                <Checkbox size="sm" colorScheme="blue">
                  {"機械"}
                </Checkbox>
                <Checkbox size="sm" colorScheme="blue">
                  {"背景"}
                </Checkbox>
                <Checkbox size="sm" colorScheme="blue">
                  {"物"}
                </Checkbox>
              </HStack>
            </Stack>
            <Text>{"タグ"}</Text>
            <HStack>
              <Checkbox size="sm" colorScheme="blue">
                {"楽しい"}
              </Checkbox>
              <Checkbox size="sm" colorScheme="blue">
                {"嬉しい"}
              </Checkbox>
              <Checkbox size="sm" colorScheme="blue">
                {"お祝い"}
              </Checkbox>
              <Checkbox size="sm" colorScheme="blue">
                {"悲しい"}
              </Checkbox>
              <Checkbox size="sm" colorScheme="blue">
                {"その他"}
              </Checkbox>
            </HStack>
          </Stack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <HStack>
            <Button colorScheme="primary" borderRadius={"full"}>
              {"追加"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
