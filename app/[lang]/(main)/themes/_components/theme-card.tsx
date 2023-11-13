"use client"

import { Avatar, Card, HStack, Image, Stack, Text } from "@chakra-ui/react"

export const ThemeCard: React.FC = () => {
  return (
    <Card>
      <Image
        boxSize={32}
        objectFit="cover"
        src="https://bit.ly/dan-abramov"
        alt="Dan Abramov"
        borderRadius={"lg"}
      />
      <Stack p={2} justifyContent={"space-between"} height={"100%"} spacing={1}>
        <Text fontSize={"sm"} fontWeight={"bold"}>
          {"作品名"}
        </Text>
        <HStack>
          <Avatar
            name="Dan Abrahmov"
            src="https://bit.ly/dan-abramov"
            size={"sm"}
          />
          <Text fontSize={"sm"}>{"名前"}</Text>
        </HStack>
      </Stack>
    </Card>
  )
}
