"use client"

import { SearchIcon } from "@chakra-ui/icons"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import type { WorksQuery } from "__generated__/apollo"
import { WorkCard } from "app/[lang]/(main)/works/_components/WorkCard"
import Link from "next/link"
import { TbQuestionMark } from "react-icons/tb"

type Props = {
  worksQuery: WorksQuery
}

export const HomeWorkSection2: React.FC<Props> = (props) => {
  return (
    <Stack as={"section"}>
      <HStack justifyContent={"space-between"} alignItems={"center"}>
        <HStack alignItems={"center"}>
          <Text fontSize="2xl" fontWeight="bold">
            {"おすすめ作品"}
          </Text>
          <Tooltip label="推奨作品のところに出てくる" fontSize="md">
            <IconButton
              aria-label={"メニュー"}
              borderRadius={"full"}
              icon={<Icon as={TbQuestionMark} />}
            />
          </Tooltip>
        </HStack>
        <Button fontSize="xs" fontWeight="bold" variant={"ghost"}>
          {"すべて見る"}
        </Button>
      </HStack>
      <SimpleGrid
        as={"ul"}
        w={"100%"}
        columns={{ base: 5, sm: 5, md: 6, lg: 7 }}
        spacing={2}
        pr={4}
        pb={4}
      >
        {props.worksQuery.works?.map((work) => (
          <Link key={work.id} href={`/works/${work.id}`}>
            <WorkCard imageURL={work.largeThumbnailImageURL} />
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
