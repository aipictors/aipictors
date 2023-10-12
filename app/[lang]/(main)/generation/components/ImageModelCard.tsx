import { Card, Stack, Button, Image, Text } from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  selectedImageModelId: string | null
  onSelectImageModelId(id: string | null): void
  imageModelId: string
  imageModelDisplayName: string
  imageModelImageURL: string | null
}

export const ImageModelCard: React.FC<Props> = (props) => {
  return (
    <Card key={props.imageModelId}>
      <Stack>
        <Button
          p={0}
          h={"auto"}
          overflow={"hidden"}
          variant={"outline"}
          borderWidth={2}
          borderColor={
            props.selectedImageModelId === props.imageModelId
              ? "primary.500"
              : "gray.200"
          }
          onClick={() => {
            props.onSelectImageModelId(props.imageModelId)
          }}
        >
          <Image
            src={props.imageModelImageURL!}
            alt={props.imageModelDisplayName}
          />
        </Button>
        <Text>{props.imageModelDisplayName}</Text>
      </Stack>
    </Card>
  )
}
