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
import { Dices, HelpCircle, RefreshCcw } from "lucide-react"

export const GenerationEditorConfigSeed = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Seed"}</Text>
        <Tooltip label="キャラや構図などを固定したいときに使用します。">
          <HelpCircle />
        </Tooltip>
      </HStack>
      <HStack>
        <NumberInput defaultValue={-1} flex={1}>
          <NumberInputField borderRadius={"full"} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <HStack spacing={2}>
          <Tooltip label="Seed値をランダムにする" fontSize="md">
            <Dices />
          </Tooltip>
          <Tooltip label="前回生成に使用したSeed値を復元する" fontSize="md">
            <RefreshCcw />
          </Tooltip>
        </HStack>
      </HStack>
    </Stack>
  )
}
