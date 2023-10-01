"use client"

import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Button,
  Card,
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
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react"

export const GenerationEditorLoraModels = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack>
        <Text fontWeight={"bold"}>{"LoRA"}</Text>
        <HStack spacing={4}>
          <Skeleton height={20} width={20} />
          <Stack>
            <Text fontSize={"xs"}>{"フラットな絵になります２"}</Text>
            <HStack>
              <Slider
                aria-label="slider-ex-2"
                colorScheme="pink"
                defaultValue={50}
                w={52}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text>{"0"}</Text>
            </HStack>
          </Stack>
        </HStack>
        <HStack spacing={4}>
          <Skeleton height={20} width={20} />
          <Stack>
            <Text fontSize={"xs"}>{"髪がより細かく描き込まれます"}</Text>
            <HStack>
              <Slider
                aria-label="slider-ex-2"
                colorScheme="pink"
                defaultValue={50}
                w={52}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text>{"0"}</Text>
            </HStack>
          </Stack>
        </HStack>
        <Button borderRadius={"full"}>{"もっとLoRAを表示する"}</Button>
        <HStack justifyContent={"space-between"}>
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
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text fontWeight={"bold"}>{"VAE"}</Text>
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
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text fontWeight={"bold"}>{"Seed"}</Text>
          <NumberInput defaultValue={-1} size={"xs"}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </Stack>
    </Card>
  )
}
