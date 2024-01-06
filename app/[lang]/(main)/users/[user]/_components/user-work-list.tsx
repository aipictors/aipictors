"use client"

import type { UserWorksQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

type Props = {
  works: NonNullable<UserWorksQuery["user"]>["works"]
}

export const UserWorkList = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <p>{"R18（n）"}</p>
        <Switch />
      </div>
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
    </div>
  )
}
