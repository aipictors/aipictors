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

export const GenerationEditorConfigStep = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Steps"}</Text>
        <Tooltip label="Steps値を大きくするほどイラストがより洗練されます。">
          <HelpCircle />
        </Tooltip>
      </HStack>
      <NumberInput defaultValue={20} min={9} max={25}>
        <NumberInputField borderRadius={"full"} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Stack>
  )
}
