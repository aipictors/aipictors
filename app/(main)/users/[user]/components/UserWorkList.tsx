"use client"
import { HStack, Link, SimpleGrid, Stack, Switch, Text } from "@chakra-ui/react"
import React from "react"
import type { UserWorksQuery } from "__generated__/apollo"
import { CardWork } from "app/(main)/works/components/CardWork"

type Props = {
  works: NonNullable<UserWorksQuery["user"]>["works"]
}

export const UserWorkList: React.FC<Props> = (props) => {
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
        {props.works.map((work) => (
          <Link key={work.id} href={`/works/${work.id}`}>
            <CardWork imageURL={work.thumbnailImage?.downloadURL} />
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
