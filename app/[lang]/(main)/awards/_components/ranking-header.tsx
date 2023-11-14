"use client"

import { HStack, Stack, Text } from "@chakra-ui/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  year: number
  month: number
  day: number
}

export const RankingHeader = (props: Props) => {
  return (
    <HStack justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ランキング"}
        </Text>
        <Stack>
          <HStack justifyContent={"center"}>
            <ChevronLeft />
            <Text>{`${props.year}年${props.month}月`}</Text>
            <ChevronRight />
          </HStack>
          {/* <Tabs isFitted variant="line">
            <TabPanels>
              <TabList mb="1em">
                <Tab>{"デイリー"}</Tab>
                <Tab>{"ウィークリー"}</Tab>
                <Tab>{"マンスリー"}</Tab>
              </TabList>
            </TabPanels>
          </Tabs> */}
        </Stack>
      </Stack>
    </HStack>
  )
}
