import { HStack, Avatar, Button, Box, Text } from "@chakra-ui/react"

type Props = {
  name: string
  imageURL?: string
}

export const FolloweeListItem: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"space-between"} p={4}>
      <HStack spacing={4}>
        <Avatar src={props.imageURL} bg="teal.500" size={"sm"} />
        <Box>
          <Text>{props.name}</Text>
        </Box>
      </HStack>
      <Button size={"sm"} borderRadius={"full"}>
        {"フォロー中"}
      </Button>
    </HStack>
  )
}
