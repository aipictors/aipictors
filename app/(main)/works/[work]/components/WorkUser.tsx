"use client"
import { Button, Card, Stack, Text, Avatar, HStack } from "@chakra-ui/react"

type Props = {
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

export const WorkUser: React.FC<Props> = (props) => {
  console.log(props)
  return (
    <Stack spacing={0} maxW={{ base: "auto", lg: "xs" }} w={"100%"}>
      <Card>
        <HStack justifyContent={"center"}>
          <Stack spacing="3">
            <Stack alignItems={"center"}>
              <Avatar size="lg" src={props.userIconImageURL} />
              <Text size="md">{props.userName}</Text>
            </Stack>
            <HStack justifyContent={"center"}>
              <Text>{`投稿数：${props.userWorksCount}`}</Text>
              <Text>{`フォロワー数：${props.userFollowersCount}`}</Text>
            </HStack>
            <HStack justifyContent={"center"}>
              <Button colorScheme="primary" borderRadius={"full"}>
                {"フォローする"}
              </Button>
              {props.userPromptonId && (
                <Button colorScheme="orange" borderRadius={"full"}>
                  {"支援"}
                </Button>
              )}
            </HStack>
            {props.userBiography && <Text>{props.userBiography}</Text>}
          </Stack>
        </HStack>
      </Card>
      <Text>{"前後の作品"}</Text>
      <Text>{"関連フォルダ"}</Text>
      <Text>{"おすすめタグ"}</Text>
      <Text>{"新着コメント"}</Text>
    </Stack>
  )
}
