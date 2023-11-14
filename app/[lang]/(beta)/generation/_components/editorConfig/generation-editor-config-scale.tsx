import {
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { HelpCircle } from "lucide-react"

export const GenerationEditorConfigScale = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Scale"}</Text>
        <Tooltip
          label="Scale値が小さいほど創造的な画像を生成できます。値が大きいほど、より厳密にテキストを解釈します。"
          fontSize="md"
        >
          <HelpCircle />
        </Tooltip>
      </HStack>
      <NumberInput defaultValue={7} min={1} max={15}>
        <NumberInputField borderRadius={"full"} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Stack>
  )
}
