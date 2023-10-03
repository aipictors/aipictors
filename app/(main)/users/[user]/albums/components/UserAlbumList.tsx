"use client"
import { Link, SimpleGrid, Stack } from "@chakra-ui/react"
import React from "react"
import type { UserAlbumsQuery } from "__generated__/apollo"
import { CardWork } from "app/(main)/works/components/CardWork"

type Props = {
  albums: NonNullable<UserAlbumsQuery["user"]>["albums"]
}

export const UserAlbumList: React.FC<Props> = (props) => {
  return (
    <Stack>
      <SimpleGrid
        as={"ul"}
        w={"100%"}
        minChildWidth={{ base: "180px", md: "240px" }}
        spacing={2}
        pr={4}
        pb={4}
      >
        {props.albums.map((album) => (
          <Link key={album.id} href={`/works/${album.id}`}>
            <CardWork imageURL={album.thumbnailImage?.downloadURL} />
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
