"use client"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Divider,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useContext } from "react"
import type {
  MuteUserMutation,
  MuteUserMutationVariables,
  ViewerMutedUsersQuery,
  ViewerMutedUsersQueryVariables,
} from "__generated__/apollo"
import {
  MuteUserDocument,
  ViewerMutedUsersDocument,
} from "__generated__/apollo"
import { MutedUser } from "app/[lang]/(main)/settings/mute/users/components/MutedUser"
import { AppContext } from "app/contexts/appContext"

export const MainSettingMuteUsers: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null, refetch } = useSuspenseQuery<
    ViewerMutedUsersQuery,
    ViewerMutedUsersQueryVariables
  >(ViewerMutedUsersDocument, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [mutation] = useMutation<MuteUserMutation, MuteUserMutationVariables>(
    MuteUserDocument,
  )

  const handleUnmute = async (userID: string) => {
    await mutation({
      variables: {
        input: {
          userId: userID,
        },
      },
    })
    await refetch()
  }

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"lg"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ミュートしているユーザ"}
        </Text>
        {data?.viewer?.mutedUsers.length === 0 && (
          <Alert status="info" borderRadius={"md"}>
            <AlertIcon />
            <AlertTitle>{"ミュートしているユーザはいません"}</AlertTitle>
          </Alert>
        )}
        <Stack divider={<Divider />}>
          {data?.viewer?.mutedUsers.map((user) => (
            <MutedUser
              key={user.id}
              name={user.name}
              iconImageURL={user.iconImage?.downloadURL ?? null}
              onClick={() => {
                handleUnmute(user.id)
              }}
            />
          ))}
        </Stack>
      </Stack>
    </HStack>
  )
}
