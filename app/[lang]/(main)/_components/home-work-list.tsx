import WorkCard from "@/[lang]/(main)/works/_components/work-card"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { Link } from "@remix-run/react"

type Props = {
  works: WorksQuery["works"]
}

export const HomeWorkList = (props: Props) => {
  return (
    <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
      {props.works?.map((work) => (
        <li key={work.id}>
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
