import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { WorkCard } from "@/routes/($lang)._main.works._index/_components/work-card"
import { Link } from "@remix-run/react"

type Props = {
  works: WorksQuery["works"]
}

export const HomeWorkList = (props: Props) => {
  return (
    <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
      {props.works?.map((work, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <li key={index}>
          <Link to={`/works/${work.id}`}>
            <WorkCard
              imageURL={work.largeThumbnailImageURL}
              imageWidth={work.largeThumbnailImageWidth}
              imageHeight={work.largeThumbnailImageHeight}
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
