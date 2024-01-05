"use client"

import type { WorksQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import Link from "next/link"

type Props = {
  works: NonNullable<WorksQuery["works"]>
}

export const WorkList = (props: Props) => {
  return (
    <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 pr-4 pb-4">
      {props.works.map((work) => (
        <Link key={work.id} href={`/works/${work.id}`}>
          <WorkCard
            imageURL={work.largeThumbnailImageURL}
            imageWith={work.largeThumbnailImageWith}
            imageHeight={work.largeThumbnailImageHeight}
          />
        </Link>
      ))}
    </ul>
  )
}
