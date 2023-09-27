"use client"
import { Stack, Text } from "@chakra-ui/react"
import React from "react"
import { UserWorkTab } from "app/(main)/users/[user]/components/UserWorkTab"

export const UserWorkList: React.FC = () => (
  <Stack>
    <UserWorkTab />
    <Text>{"投稿画像"}</Text>
  </Stack>
)
