"use client"
import { useSuspenseQuery } from "@apollo/client"
import { Box, Divider, HStack, Stack, Text } from "@chakra-ui/react"
import { useContext } from "react"
import type {
  ViewerMutedUsersQuery,
  ViewerMutedUsersQueryVariables,
} from "__generated__/apollo"
import { ViewerMutedUsersDocument } from "__generated__/apollo"
import { MutedUser } from "app/(main)/settings/mute/users/components/MutedUser"
import { AppContext } from "app/contexts/appContext"

export const MainSettingMuteUsers: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    ViewerMutedUsersQuery,
    ViewerMutedUsersQueryVariables
  >(ViewerMutedUsersDocument, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ミュートしているユーザ"}
        </Text>
        {data?.viewer?.mutedUsers.length === 0 && (
          <Stack>
            <Box>
              <Text>{"ミュートしているユーザはいません"}</Text>
            </Box>
          </Stack>
        )}
        <Stack divider={<Divider />}>
          {data?.viewer?.mutedUsers.map((user) => (
            <MutedUser
              key={user.id}
              name={user.name}
              iconImageURL={user.iconImage?.downloadURL ?? null}
            />
          ))}
        </Stack>
      </Stack>
    </HStack>
  )
}
