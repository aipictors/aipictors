"use client"
import {
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react"

export const SettingRequestForm: React.FC = () => {
  return (
    <Stack w={"100%"} spacing={8}>
      <Text fontWeight={"bold"} fontSize={"2xl"}>
        {"支援リクエスト"}
      </Text>
      <Stack>
        <Text>
          {"支援リクエストを受けるには累計いいね数20必要です（現在：現在数）"}
        </Text>
        <HStack>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"支援リクエストを許可する"}</FormLabel>
            <Switch />
          </FormControl>
        </HStack>
      </Stack>
    </Stack>
  )
}
