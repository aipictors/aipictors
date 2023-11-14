"use client"

import { Card, CardBody, Skeleton, Stack } from "@chakra-ui/react"

export const SelectableWorkCard = () => {
  return (
    <Card>
      <CardBody>
        <Stack>
          <Skeleton height={16} />
          <Skeleton height={4} />
        </Stack>
      </CardBody>
    </Card>
  )
}
