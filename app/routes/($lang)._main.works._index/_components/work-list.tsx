import type { worksQuery } from "@/_graphql/queries/work/works"
import { WorkCard } from "@/routes/($lang)._main.works._index/_components/work-card"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"

type Props = {
  works: ResultOf<typeof worksQuery>["works"]
}

/**
 * 作品画像一覧
 */
export const WorkList = (props: Props) => {
  return (
    <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
      {props.works.map((work) => (
        <Link key={work.id} to={`/works/${work.id}`}>
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
