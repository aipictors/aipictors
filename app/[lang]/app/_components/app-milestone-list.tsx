"use client"

import { milestonesQuery } from "@/_graphql/queries/milestone/miestones"
import { useSuspenseQuery } from "@apollo/client"

export const AppMilestoneList = () => {
  const { data: milestones } = useSuspenseQuery(milestonesQuery, {
    variables: { repository: "app" },
  })

  return (
    <div className="p-4">
      <p className="font-bold">{"マイルストーン"}</p>
      {milestones.milestones.map((milestone) => (
        <div
          key={milestone.id}
          className="overflow-hidden rounded-lg bg-white shadow-lg"
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
