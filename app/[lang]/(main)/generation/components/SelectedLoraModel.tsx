"use client"

import {
  Button,
  Card,
  HStack,
  Image,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react"

type Props = {
  imageURL: string
  name: string
  description: string
  value: number
  setValue(value: number): void
  onDelete(): void
}

export const SelectedLoraModel: React.FC<Props> = (props) => {
  return (
    <HStack spacing={4}>
      <Card>
        <Stack>
          <Button
            p={0}
            h={"auto"}
            overflow={"hidden"}
            variant={"outline"}
            borderWidth={2}
            borderColor={"gray.200"}
          >
            <Image
              src={props.imageURL ?? ""}
              alt={props.name}
              borderRadius={"md"}
              w={"100%"}
              maxW={32}
              draggable={false}
            />
          </Button>
        </Stack>
      </Card>
      <Stack
        flex={1}
        overflow={"hidden"}
        justifyContent={"space-between"}
        h={"100%"}
      >
        <Stack>
          <Text
            fontSize={"xl"}
            fontWeight={"bold"}
            whiteSpace={"pre-wrap"}
            lineHeight={1.2}
          >
            {props.name}
          </Text>
          <Text
            fontSize={"xs"}
            opacity={0.8}
            whiteSpace={"pre-wrap"}
            lineHeight={1.2}
          >
            {props.description}
          </Text>
        </Stack>
        <Stack>
          <HStack>
            <Slider
              aria-label="slider-ex-2"
              colorScheme="pink"
              value={props.value}
              min={-1}
              max={1}
              step={0.01}
              onChange={(value) => props.setValue(value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <HStack w={16} justifyContent={"flex-end"}>
              <Text>{props.value.toFixed(2)}</Text>
            </HStack>
          </HStack>
          <Button size={"xs"} onClick={props.onDelete}>
            {"削除"}
          </Button>
        </Stack>
      </Stack>
    </HStack>
  )
}
