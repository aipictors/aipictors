import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { WorkCard } from "@/routes/($lang)._main.posts._index/_components/work-card"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * 作品画像一覧
 */
export const WorkList = (props: Props) => {
  return (
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
  )
}