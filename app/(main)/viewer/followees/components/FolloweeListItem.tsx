import { HStack, Avatar, Button, Box, Text } from "@chakra-ui/react"
import type { FC } from "react"

export const FolloweeListItem: FC = () => {
  return (
    <HStack justifyContent={"space-between"} p={4}>
      <HStack spacing={4}>
        <Avatar bg="teal.500" size={"sm"} />
        <Box>
          <Text>{"プロンプトン"}</Text>
        </Box>
      </HStack>
      <Button size={"sm"} borderRadius={"full"}>
        {"フォロー中"}
      </Button>
    </HStack>
  )
}
