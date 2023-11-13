"use client"

import { FormControl, FormLabel, Stack, Switch, Text } from "@chakra-ui/react"

export const SettingRestrictionForm: React.FC = () => {
  return (
    <Stack w={"100%"} spacing={8}>
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
    </Stack>
  )
}
