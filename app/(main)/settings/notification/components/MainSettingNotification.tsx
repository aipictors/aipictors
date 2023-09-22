"use client"
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react"

export const MainSettingNotification: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"通知・いいね"}
        </Text>
        <Stack>
          <Text>{"匿名いいね"}</Text>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"全年齢いいね"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"R-18いいね"}</FormLabel>
            <Switch />
          </FormControl>
        </Stack>
        <Stack>
          <Text>{"オフにすると次回以降の通知がされなくなります"}</Text>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"定期いいね通知"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"リアルタイムいいね通知"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"コメント"}</FormLabel>
            <Switch />
          </FormControl>
        </Stack>
        <Button colorScheme="primary" borderRadius={"full"} onChange={() => {}}>
          {"変更を保存"}
        </Button>
      </Stack>
    </HStack>
  )
}
