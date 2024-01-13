"use client"

import type { WorksQuery } from "@/__generated__/apollo"
import HomeWorkAlbum from "@/app/[lang]/(main)/_components/home-work-album"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import PhotoAlbum from "react-photo-album"

type Props = {
  works: NonNullable<WorksQuery["works"]>
  title: string
  tooltip?: string
}

export const HomeWorkSection = (props: Props) => {
  // 各作品のデータを変換
  const photos = props.works.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
  }))

  return (
    <section className="space-y-4 pl-4 pr-4 lg:pr-8">
      <div className="flex justify-between">
        <h2 className="items-center space-x-2 text-2xl font-bold">
          {props.title}
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <QuestionMarkCircledIcon className="inline h-6 w-auto" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h2>
        <Button variant={"secondary"} size={"sm"}>
          {"すべて見る"}
        </Button>
      </div>
      <PhotoAlbum
        layout="rows"
        columns={3}
        photos={photos}
        renderPhoto={(photoProps) => (
          // @ts-ignore 後で考える
          <HomeWorkAlbum {...photoProps} workId={photoProps.photo.workId} />
        )}
        defaultContainerWidth={1200}
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
      />
    </section>
  )
}
