import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { WorkCard } from "~/routes/($lang)._main.posts._index/components/work-card"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * 作品画像一覧
 */
export function WorkList(props: Props) {
  return (
    <ul className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8">
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
