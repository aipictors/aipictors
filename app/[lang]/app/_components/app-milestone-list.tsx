"use client"

import {
  MilestonesQuery,
  MilestonesQueryVariables,
} from "@/graphql/__generated__/graphql"
import { milestonesQuery } from "@/graphql/queries/milestone/miestones"
import { useSuspenseQuery } from "@apollo/client"

export const AppMilestoneList = () => {
  const { data: milestones } = useSuspenseQuery<
    MilestonesQuery,
    MilestonesQueryVariables
  >(milestonesQuery, {
    variables: { repository: "app" },
  })

  return (
    <div className="p-4">
      <p className="font-bold">{"マイルストーン"}</p>
      {milestones.milestones.map((milestone) => (
        <div
          key={milestone.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="p-4">
            <p>{milestone.version}</p>
            <p className="font-bold">{milestone.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
