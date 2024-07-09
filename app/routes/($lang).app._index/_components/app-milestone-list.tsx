import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

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

export const milestonesQuery = graphql(
  `query Milestones($repository: String!) {
    milestones(where: {repository: $repository}) {
      id
      title
      version
      description
      pageURL
      isDone
      dueDate
    }
  }`,
)
