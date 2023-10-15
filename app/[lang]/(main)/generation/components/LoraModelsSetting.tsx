import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { TbDice3, TbRefresh } from "react-icons/tb"

export const LoraModelsSetting: React.FC = () => {
  return (
    <Stack>
      <Text fontWeight={"bold"}>{"サイズ"}</Text>
      <Select placeholder="【縦長】768×1152(upscale:1.5)" size={"sm"}>
        <option value="option1">{"【正方形】768×768(upscale:1.5)"}</option>
        <option value="option2">{"【縦長】768×1200(upscale:1.5)"}</option>
        <option value="option3">{"【横長】1200×768(upscale:1.5)"}</option>
      </Select>
      <HStack>
        <Text fontWeight={"bold"}>{"VAE"}</Text>
        <Tooltip label="出力される色や線を調整します。" fontSize="md">
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <Select defaultValue={"option3"} size={"sm"}>
        <option value="option1">{"なし"}</option>
        <option value="option2">{"kl-f8-anime2"}</option>
        <option value="option3">{"ClearVAE_V2.3"}</option>
      </Select>
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
        <NumberInput defaultValue={-1} size={"sm"} borderRadius={"md"}>
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
              icon={<Icon as={TbRefresh} fontSize={"lg"} />}
              borderRadius={"md"}
              size={"sm"}
              onClick={() => {
                alert("前回生成に使用したSeed値を復元する")
              }}
            />
          </Tooltip>
        </HStack>
      </HStack>
      <HStack>
        <Text fontWeight={"bold"}>{"Steps"}</Text>
        <Tooltip
          label="Steps値を大きくするほどイラストがより洗練されます。"
          fontSize="md"
        >
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <NumberInput
        defaultValue={20}
        size={"sm"}
        borderRadius={"md"}
        min={9}
        max={25}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <HStack>
        <Text fontWeight={"bold"}>{"Scale"}</Text>
        <Tooltip
          label="Scale値が小さいほど創造的な画像を生成できます。値が大きいほど、より厳密にテキストを解釈します。"
          fontSize="md"
        >
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <NumberInput
        defaultValue={7}
        size={"sm"}
        borderRadius={"md"}
        min={1}
        max={15}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <HStack>
        <Text fontWeight={"bold"}>{"Sampler"}</Text>
        <Tooltip label="ノイズの除去の手法です。" fontSize="md">
          <Button size={"xs"} borderRadius={"full"}>
            {"?"}
          </Button>
        </Tooltip>
      </HStack>
      <Select defaultValue={"option3"} size={"sm"}>
        <option value="option1">{"Euler a"}</option>
        <option value="option2">{"Euler"}</option>
        <option value="option3">{"Heun"}</option>
        <option value="option4">{"DPM2"}</option>
        <option value="option5">{"DPM2 a"}</option>
        <option value="option6">{"DPM++ 2S a"}</option>
        <option value="option7">{"DPM++ 2M"}</option>
        <option value="option8">{"LMS Karras"}</option>
        <option value="option9">{"DPM2 a Karras"}</option>
        <option value="option10">{"DPM++ 2S a Karras"}</option>
        <option value="option11">{"DPM++ SDE Karras"}</option>
        <option value="option12">{"DPM++ 2M Karras"}</option>
        <option value="option13">{"DPM++ 2M SDE Karras"}</option>
        <option value="option14">{"DDIM"}</option>
      </Select>
    </Stack>
  )
}
