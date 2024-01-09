import type { WorksQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import Link from "next/link"

type Props = {
  works: WorksQuery["works"]
}

export const HomeWorkList = (props: Props) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-4 pb-4 w-full">
      {props.works?.map((work) => (
        <li key={work.id}>
          <Link href={`/works/${work.id}`}>
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
