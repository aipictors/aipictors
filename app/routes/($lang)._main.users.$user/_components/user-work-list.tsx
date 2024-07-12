import { Switch } from "@/_components/ui/switch"
import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { WorkCard } from "@/routes/($lang)._main.posts._index/_components/work-card"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

export const UserWorkList = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <p>{"R18（n）"}</p>
        <Switch />
      </div>
      <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
        {props.works.map((work) => (
          <Link key={work.id} to={`/posts/${work.id}`}>
            <WorkCard
              imageURL={work.largeThumbnailImageURL}
              imageWidth={work.largeThumbnailImageWidth}
              imageHeight={work.largeThumbnailImageHeight}
            />
          </Link>
        ))}
      </ul>
    </div>
  )
}
