"use client"

import {
  Button,
  Card,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"

type Props = {
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  selectedImageLoraModelId: string | null
  onSelectImageLoraModelId(id: string | null): void
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
              src={props.imageLoraModels[0].thumbnailImageURL ?? ""}
              alt={props.imageLoraModels[0].name}
              borderRadius={"md"}
              w={"100%"}
              maxW={32}
            />
          </Button>
        </Stack>
      </Card>
      <Stack flex={1}>
        <Text fontSize={"lg"}>{props.imageLoraModels[0].name}</Text>
        <Text fontSize={"xs"}>{"フラットな絵になります２"}</Text>
        <HStack>
          <Slider aria-label="slider-ex-2" colorScheme="pink" defaultValue={50}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>{"0"}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
