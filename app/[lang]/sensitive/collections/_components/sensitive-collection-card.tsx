"use client"

import { Card, CardHeader, Text } from "@chakra-ui/react"

export const SensitiveCollectionCard: React.FC = () => {
  return (
    <Card as={"article"}>
      <CardHeader as={"header"}>
        <Text>{"タイトル"}</Text>
      </CardHeader>
    </Card>
  )
}
