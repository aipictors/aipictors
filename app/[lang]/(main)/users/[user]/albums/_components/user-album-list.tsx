"use client"

import type { UserAlbumsQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import { HStack, Link, SimpleGrid, Stack, Switch, Text } from "@chakra-ui/react"

type Props = {
  albums: NonNullable<UserAlbumsQuery["user"]>["albums"]
}

export const UserAlbumList = (props: Props) => {
  return (
    <Stack>
      <HStack>
        <Text>{"R18（n）"}</Text>
        <Switch />
      </HStack>
      <SimpleGrid
        as={"ul"}
        w={"100%"}
        minChildWidth={{ base: "180px", md: "240px" }}
        spacing={2}
        pr={4}
        pb={4}
      >
        {props.albums.map((album) => (
          <Link key={album.id} href={`/albums/${album.id}`}>
            <WorkCard imageURL={album.thumbnailImage?.downloadURL} />
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
