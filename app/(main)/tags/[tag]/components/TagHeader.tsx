"use client"
import { HStack, Skeleton, Text } from "@chakra-ui/react"

export const TagHeader: React.FC = () => {
  return (
    <HStack justifyContent={"center"}>
      <Text>
        <Skeleton w={32} h={8} />
      </Text>
    </HStack>
  )
}
