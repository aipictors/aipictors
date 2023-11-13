"use client"

import {
  MilestonesDocument,
  MilestonesQuery,
  MilestonesQueryVariables,
} from "@/__generated__/apollo"
import { useSuspenseQuery } from "@apollo/client"
import { Card, Stack, Text } from "@chakra-ui/react"

export const AppMilestoneList: React.FC = () => {
  const { data: milestones } = useSuspenseQuery<
    MilestonesQuery,
    MilestonesQueryVariables
  >(MilestonesDocument, {
    variables: { repository: "app" },
  })

  return (
    <Stack p={4}>
      <Text fontWeight={"bold"}>{"マイルストーン"}</Text>
      {milestones.milestones.map((milestone) => (
        <Card key={milestone.id} variant={"filled"}>
          <Stack p={4}>
            <Text>{milestone.version}</Text>
            <Text fontWeight={"bold"}>{milestone.title}</Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
