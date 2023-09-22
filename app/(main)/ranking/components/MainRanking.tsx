"use client"
import { HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react"
import { TbChevronLeft, TbChevronRight } from "react-icons/tb"

export const MainRanking: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
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
            <Text>{"2023年9月22日"}</Text>
            <IconButton
              aria-label="previous month"
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
