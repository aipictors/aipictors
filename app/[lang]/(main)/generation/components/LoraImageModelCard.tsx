import { Card, Stack, Button, Image, Text } from "@chakra-ui/react"

type Props = {
  onSelect(): void
  name: string
  description: string | null
  imageURL: string | null
  isActive: boolean
}

export const LoraImageModelCard: React.FC<Props> = (props) => {
  return (
    <Card>
      <Stack>
        <Button
          p={0}
          h={"auto"}
          overflow={"hidden"}
          variant={"outline"}
          borderWidth={2}
          borderRadius={"md"}
          borderColor={props.isActive ? "primary.500" : "gray.200"}
          onClick={() => {
            props.onSelect()
          }}
        >
          <Image src={props.imageURL!} alt={props.name} />
        </Button>
        <Stack spacing={0}>
          <Text fontSize={"sm"}>{props.name}</Text>
          <Text fontSize={"xs"}>{props.description}</Text>
        </Stack>
      </Stack>
    </Card>
  )
}
