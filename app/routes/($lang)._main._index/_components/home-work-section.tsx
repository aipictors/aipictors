import { Button } from "@/_components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { HomeWorkAlbum } from "@/routes/($lang)._main._index/_components/home-work-album"
import { RiQuestionLine } from "@remixicon/react"
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
    workOwnerUserId: work.user.id,
  }))

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h2 className="items-center space-x-2 font-bold text-2xl">
          {props.title}
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="inline h-6 w-auto" />
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
          <HomeWorkAlbum
            {...photoProps}
            workId={photoProps.photo.workId}
            workOwnerUserId={photoProps.photo.workOwnerUserId}
          />
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
