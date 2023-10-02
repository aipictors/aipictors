"use client"
import { HStack, Switch, Text } from "@chakra-ui/react"
import React from "react"

export const UserCollectionList: React.FC = () => {
  return (
    <HStack>
      <Text>{"ぼかしを外す"}</Text>
      <Switch />
    </HStack>
  )
}
