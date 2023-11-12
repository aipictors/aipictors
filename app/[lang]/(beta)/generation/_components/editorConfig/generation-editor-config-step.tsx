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

export const GenerationEditorConfigStep: React.FC = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Steps"}</Text>
        <Tooltip label="Steps値を大きくするほどイラストがより洗練されます。">
          <IconButton
            aria-label={"メニュー"}
            borderRadius={"full"}
            icon={<Icon as={TbQuestionMark} />}
            size={"sm"}
          />
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
