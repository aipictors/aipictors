"use client"
import { Box, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react"

export const DownloadStickerList: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"lg"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"DL済みスタンプ"}
        </Text>
        <SimpleGrid
          as={"ul"}
          w={"100%"}
          spacing={2}
          pr={4}
          columns={{ base: 2, md: 4, lg: 7 }}
          justifyItems={""}
        >
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
          <Box bg="tomato" height="80px" />
        </SimpleGrid>
      </Stack>
    </HStack>
  )
}
