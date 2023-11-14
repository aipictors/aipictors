"use client"

import {
  HStack,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { RefreshCcw } from "lucide-react"

export const InPaintingSetting = () => {
  return (
    <HStack>
      <HStack justifyContent={"flex-start"}>
        <RefreshCcw />
      </HStack>
      <Stack spacing={4}>
        <HStack>
          <Text>{"ブラシサイズ："}</Text>
          <Slider
            aria-label="slider-ex-2"
            colorScheme="pink"
            defaultValue={50}
            w={32}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
        <HStack>
          <Text>{"画像拡大率："}</Text>
          <Slider
            aria-label="slider-ex-2"
            colorScheme="pink"
            defaultValue={50}
            w={32}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
        <HStack>
          <Text>{"ノイズ除去強度："}</Text>
          <Text>{"弱"}</Text>
          <Slider
            aria-label="slider-ex-2"
            colorScheme="pink"
            defaultValue={50}
            w={32}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>{"強"}</Text>
        </HStack>
        <HStack>
          <Text>{"マスク方式："}</Text>
          <RadioGroup defaultValue="1">
            <Stack spacing={5} direction="row">
              <Radio colorScheme="blue" value="1">
                {"塗りつぶし"}
              </Radio>
              <Radio colorScheme="blue" value="2">
                {" もとに近い"}
              </Radio>
              <Radio colorScheme="blue" value="3">
                {"もとから大きく変更"}
              </Radio>
              <Radio colorScheme="blue" value="4">
                {"ほぼ変えない"}
              </Radio>
            </Stack>
          </RadioGroup>
        </HStack>
      </Stack>
    </HStack>
  )
}
