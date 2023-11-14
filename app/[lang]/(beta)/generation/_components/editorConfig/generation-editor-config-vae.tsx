import {
  HStack,
  Icon,
  IconButton,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { TbQuestionMark } from "react-icons/tb"

/**
 * VAEの設定
 * @returns
 */
export const GenerationEditorConfigVae = () => {
  return (
    <Stack>
      <HStack spacing={2}>
        <Text fontWeight={"bold"}>{"VAE"}</Text>
        <Tooltip label="出力される色や線を調整します。">
          <IconButton
            aria-label={"メニュー"}
            borderRadius={"full"}
            size={"sm"}
            icon={<Icon as={TbQuestionMark} />}
          />
        </Tooltip>
      </HStack>
      <Select defaultValue={"option3"} borderRadius={"full"}>
        <option value="option1">{"なし"}</option>
        <option value="option2">{"kl-f8-anime2"}</option>
        <option value="option3">{"ClearVAE_V2.3"}</option>
      </Select>
    </Stack>
  )
}
