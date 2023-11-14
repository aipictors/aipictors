"use client"

import { Card, CardHeader, Text } from "@chakra-ui/react"

export const NovelCard = () => {
  return (
    <Card as={"article"}>
      <CardHeader as={"header"}>
        <Text>{"タイトル"}</Text>
      </CardHeader>
    </Card>
  )
}
