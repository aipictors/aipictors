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

export const MainSettingContents: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"非表示対象"}
        </Text>
        <Stack spacing={4}>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"R-18"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"R-18G"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"性的描写（軽度な描写も含む）"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"全年齢"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>
              {"宣伝など作品に関係のない可能性のあるキャプションは非表示"}
            </FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"宣伝の可能性のある作品は非表示"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>
              {"センシティブなコンテンツを表示する（メンテナンス中）"}
            </FormLabel>
            <Switch />
          </FormControl>
        </Stack>
        <Stack>
          <Button colorScheme="primary" borderRadius={"full"}>
            {"変更を保存"}
          </Button>
        </Stack>
      </Stack>
    </HStack>
  )
}
