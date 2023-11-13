"use client"

import { HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react"
import { TbChevronLeft, TbChevronRight } from "react-icons/tb"

type Props = {
  year: number
  month: number
  day: number
}

export const RankingHeader: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ランキング"}
        </Text>
        <Stack>
          <HStack justifyContent={"center"}>
            <IconButton
              aria-label="previous month"
              icon={<Icon as={TbChevronLeft} fontSize={"lg"} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
            <Text>{`${props.year}年${props.month}月`}</Text>
            <IconButton
              aria-label="next month"
              icon={<Icon as={TbChevronRight} fontSize={"lg"} />}
              variant={"ghost"}
              borderRadius={"full"}
            />
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
