"use client"

import {
  Button,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Search } from "lucide-react"

export const UserWorkListActions = () => (
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
        icon={<Search />}
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
