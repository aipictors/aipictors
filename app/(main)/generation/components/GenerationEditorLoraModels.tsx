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
  Tooltip,
  Image,
  useDisclosure,
} from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"
import { LoraModelsModal } from "app/(main)/generation/components/LoraModelsModal"
import { LoraModelsSetting } from "app/(main)/generation/components/LoraModelsSetting"

type Props = {
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  selectedImageLoraModelId: string | null
  onSelectImageLoraModelId(id: string | null): void
}

export const GenerationEditorLoraModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card p={4} h={"100%"}>
        <Stack>
          <HStack>
            <Text fontWeight={"bold"}>{"加工（LoRA）"}</Text>
            <Tooltip
              label="イラストの絵柄を調整することができます。"
              fontSize="md"
            >
              <Button size={"xs"} borderRadius={"full"}>
                {"?"}
              </Button>
            </Tooltip>
          </HStack>
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
                <Slider
                  aria-label="slider-ex-2"
                  colorScheme="pink"
                  defaultValue={50}
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
                    src={props.imageLoraModels[1].thumbnailImageURL!}
                    alt={props.imageLoraModels[1].name}
                    borderRadius={"md"}
                    maxW={32}
                  />
                </Button>
              </Stack>
            </Card>
            <Stack flex={1}>
              <Text fontSize={"lg"}>{props.imageLoraModels[1].name}</Text>
              <Text fontSize={"xs"}>{"髪がより細かく描き込まれます"}</Text>
              <HStack>
                <Slider
                  aria-label="slider-ex-2"
                  colorScheme="pink"
                  defaultValue={50}
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
          <Button borderRadius={"full"} onClick={onOpen}>
            {"もっとLoRAを表示する"}
          </Button>
          <LoraModelsSetting />
        </Stack>
      </Card>
      <LoraModelsModal
        isOpen={isOpen}
        onClose={onClose}
        imageLoraModels={props.imageLoraModels}
        selectedImageLoraModelId={props.selectedImageLoraModelId}
        onSelectImageLoraModelId={props.onSelectImageLoraModelId}
      />
    </>
  )
}
