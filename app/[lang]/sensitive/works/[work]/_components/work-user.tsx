"use client"
import { PromptonRequestButton } from "@/app/[lang]/(main)/works/[work]/_components/prompton-request-button"
import { Avatar, Button, Card, HStack, Stack, Text } from "@chakra-ui/react"

type Props = {
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

export const WorkUser = (props: Props) => {
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
              {props.userPromptonId && <PromptonRequestButton />}
            </HStack>
            {props.userBiography && <Text>{props.userBiography}</Text>}
          </Stack>
        </HStack>
      </Card>
      <Text>{"前後の作品"}</Text>
    </Stack>
  )
}
