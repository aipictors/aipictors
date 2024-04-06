"use client"

import WorkCard from "@/[lang]/(main)/works/_components/work-card"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import Link from "next/link"

type Props = {
  works: NonNullable<WorksQuery["works"]>
}

/**
 * 作品画像一覧
 */
export const WorkList = (props: Props) => {
  return (
    <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
      {props.works.map((work) => (
        <Link key={work.id} href={`/works/${work.id}`}>
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
