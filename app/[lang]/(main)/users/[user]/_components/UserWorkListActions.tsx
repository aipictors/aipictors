"use client"

import {
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { TbSearch } from "react-icons/tb"

export const UserWorkListActions: React.FC = () => (
  <Stack spacing={4}>
    <HStack>
      <Input
        placeholder="Select Date and Time"
        size="sm"
        type="datetime-local"
        maxW={48}
      />
      <Text>{"～"}</Text>
      <Input
        placeholder="Select Date and Time"
        size="sm"
        type="datetime-local"
        maxW={48}
      />
      <IconButton
        aria-label={"メニュー"}
        borderRadius={"full"}
        size={"sm"}
        icon={<Icon as={TbSearch} />}
      />
      <Button borderRadius={"full"} size={"sm"}>
        {"タイルモードON"}
      </Button>
      <Button borderRadius={"full"} size={"sm"}>
        {"いいね順（現在新しい順）"}
      </Button>
    </HStack>
  </Stack>
)
