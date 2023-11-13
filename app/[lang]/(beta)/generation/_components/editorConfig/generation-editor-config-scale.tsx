import {
  HStack,
  Icon,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { TbQuestionMark } from "react-icons/tb"

export const GenerationEditorConfigScale: React.FC = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Scale"}</Text>
        <Tooltip
          label="Scale値が小さいほど創造的な画像を生成できます。値が大きいほど、より厳密にテキストを解釈します。"
          fontSize="md"
        >
          <IconButton
            aria-label={"メニュー"}
            borderRadius={"full"}
            icon={<Icon as={TbQuestionMark} />}
            size={"sm"}
          />
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
