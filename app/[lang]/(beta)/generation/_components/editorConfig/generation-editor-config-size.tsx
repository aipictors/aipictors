import { Select, Stack, Text } from "@chakra-ui/react"

export const GenerationEditorConfigSize = () => {
  return (
    <Stack>
      <Text fontWeight={"bold"}>{"サイズ"}</Text>
      <Select borderRadius={"full"}>
        <option value={"SD1_512_512"}>
          {"【正方形】768×768(upscale:1.5)"}
        </option>
        <option value={"SD1_512_768"}>{"【縦長】768×1200(upscale:1.5)"}</option>
        <option value={"SD1_768_512"}>{"【横長】1200×768(upscale:1.5)"}</option>
        <option value={"SD2_768_768"}>
          {"【正方形】768×768(upscale:1.5)"}
        </option>
        <option value={"SD2_768_1200"}>
          {"【縦長】768×1200(upscale:1.5)"}
        </option>
        <option value={"SD2_1200_768"}>
          {"【横長】1200×768(upscale:1.5)"}
        </option>
      </Select>
    </Stack>
  )
}
