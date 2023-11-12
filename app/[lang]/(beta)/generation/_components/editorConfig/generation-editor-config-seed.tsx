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
import { TbDice3, TbQuestionMark, TbRefresh } from "react-icons/tb"

export const GenerationEditorConfigSeed: React.FC = () => {
  return (
    <Stack>
      <HStack>
        <Text fontWeight={"bold"}>{"Seed"}</Text>
        <Tooltip label="キャラや構図などを固定したいときに使用します。">
          <IconButton
            aria-label={"メニュー"}
            borderRadius={"full"}
            icon={<Icon as={TbQuestionMark} />}
            size={"sm"}
          />
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
            <IconButton
              aria-label="previous month"
              icon={<Icon as={TbDice3} fontSize={"lg"} />}
              borderRadius={"full"}
              onClick={() => {
                alert("Seed値をランダムにする")
              }}
            />
          </Tooltip>
          <Tooltip label="前回生成に使用したSeed値を復元する" fontSize="md">
            <IconButton
              aria-label="previous month"
              icon={<Icon as={TbRefresh} fontSize={"lg"} />}
              borderRadius={"full"}
              onClick={() => {
                alert("前回生成に使用したSeed値を復元する")
              }}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Stack>
  )
}
