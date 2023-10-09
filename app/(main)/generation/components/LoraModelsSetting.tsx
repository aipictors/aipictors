import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Stack,
  Button,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip,
  Icon,
  IconButton,
} from "@chakra-ui/react"
import { TbDice3, TbRepeat } from "react-icons/tb"

export const LoraModelsSetting: React.FC = () => {
  return (
    <Stack>
      <Text fontWeight={"bold"}>{"サイズ"}</Text>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size={"xs"}>
          {"【縦長】768×1152"}
        </MenuButton>
        <MenuList>
          <MenuItem>{"【正方形】n×n"}</MenuItem>
          <MenuItem>{"【縦長】n×n"}</MenuItem>
          <MenuItem>{"【横長】n×n"}</MenuItem>
        </MenuList>
      </Menu>
      <HStack>
        <Text fontWeight={"bold"}>{"VAE"}</Text>
        <Tooltip label="出力される色や線を調整します。" fontSize="md">
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size={"xs"}>
          {""}
        </MenuButton>
        <MenuList>
          <MenuItem>{"なし"}</MenuItem>
          <MenuItem>{"vae"}</MenuItem>
          <MenuItem>{"vae"}</MenuItem>
        </MenuList>
      </Menu>
      <HStack>
        <Text fontWeight={"bold"}>{"Seed"}</Text>
        <Tooltip
          label="キャラや構図などを固定したいときに使用します。"
          fontSize="md"
        >
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <HStack>
        <NumberInput defaultValue={-1} size={"xs"}>
          <NumberInputField />
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
              borderRadius={"md"}
              size={"sm"}
              onClick={() => {
                alert("Seed値をランダムにする")
              }}
            />
          </Tooltip>
          <Tooltip label="前回生成に使用したSeed値を復元する" fontSize="md">
            <IconButton
              aria-label="previous month"
              icon={<Icon as={TbRepeat} fontSize={"lg"} />}
              borderRadius={"md"}
              size={"sm"}
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
