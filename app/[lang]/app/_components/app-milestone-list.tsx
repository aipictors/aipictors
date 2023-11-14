"use client"

import {
  MilestonesDocument,
  MilestonesQuery,
  MilestonesQueryVariables,
} from "@/__generated__/apollo"
import { useSuspenseQuery } from "@apollo/client"

export const AppMilestoneList = () => {
  const { data: milestones } = useSuspenseQuery<
    MilestonesQuery,
    MilestonesQueryVariables
  >(MilestonesDocument, {
    variables: { repository: "app" },
  })

  return (
    <div className="p-4">
      <p className="font-bold">マイルストーン</p>
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
