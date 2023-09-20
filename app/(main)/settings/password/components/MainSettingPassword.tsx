"use client"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { TbEye } from "react-icons/tb"

export const MainSettingPassword: React.FC = () => {
  const [userPassword, setUserPassword] = useState("")

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"パスワード"}
        </Text>
        <Stack>
          <Text fontSize={12}>
            {"パスワード強度スコアが3以上（バーが黄色～緑色）"}
          </Text>
          <Text fontSize={12}>
            {"※ パスワード変更後は画面更新して再ログインしてください"}
          </Text>
          <HStack>
            <Input
              placeholder="新しいログインパスワード"
              value={userPassword}
              onChange={(event) => {
                setUserPassword(event.target.value)
              }}
            />
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbEye} />}
            />
          </HStack>
          <Progress value={80} />
        </Stack>
        <Button colorScheme="primary" borderRadius={"full"} onClick={() => {}}>
          {"変更を保存"}
        </Button>
      </Stack>
    </HStack>
  )
}
