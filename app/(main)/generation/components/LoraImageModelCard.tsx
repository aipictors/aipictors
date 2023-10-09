import { Card, Stack, Button, Image, Text } from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"

type Props = {
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  selectedImageLoraModelId: string | null
  onSelectImageLoraModelId(id: string | null): void
  imageLoraModelId: string
  imageLoraModelName: string
  imageLoraModelDescription: string | null
  imageLoraModelImageURL: string | null
}

export const LoraImageModelCard: React.FC<Props> = (props) => {
  return (
    <Card key={props.imageLoraModelId}>
      <Stack>
        <Button
          p={0}
          h={"auto"}
          overflow={"hidden"}
          variant={"outline"}
          borderWidth={2}
          borderRadius={"md"}
          borderColor={
            props.selectedImageLoraModelId === props.imageLoraModelId
              ? "primary.500"
              : "gray.200"
          }
          onClick={() => {
            props.onSelectImageLoraModelId(props.imageLoraModelId)
          }}
        >
          <Image
            src={props.imageLoraModelImageURL!}
            alt={props.imageLoraModelName}
          />
        </Button>
        <Stack spacing={0}>
          <Text fontSize={"sm"}>{props.imageLoraModelName}</Text>
          <Text fontSize={"xs"}>{props.imageLoraModelDescription}</Text>
        </Stack>
      </Stack>
    </Card>
  )
}
