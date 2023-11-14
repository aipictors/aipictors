"use client"

import type { UserQuery } from "@/__generated__/apollo"
import { Image, Stack } from "@chakra-ui/react"

type Props = {
  user: NonNullable<UserQuery["user"]>
}

export const UserProfileHeader = (props: Props) => {
  return (
    <Stack>
      <Image
        src={props.user.headerImage?.downloadURL ?? ""}
        alt={props.user.name}
        borderRadius={"md"}
      />
    </Stack>
  )
}
