"use client"

import WorkCard from "@/app/[lang]/(main)/works/_components/work-card"
import type { WorksQuery } from "@/graphql/__generated__/graphql"
import Link from "next/link"

type Props = {
  works: NonNullable<WorksQuery["works"]>
}

/**
 * 作品画像一覧
 */
export const WorkList = (props: Props) => {
  return (
    <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 pr-4 pb-4">
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
