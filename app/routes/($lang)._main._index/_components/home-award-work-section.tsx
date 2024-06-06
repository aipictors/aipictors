import { Button } from "@/_components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import type { WorkAwardsQuery } from "@/_graphql/__generated__/graphql"
import { HomeWorkAlbum } from "@/routes/($lang)._main._index/_components/home-work-album"
import { RiQuestionLine } from "@remixicon/react"
import PhotoAlbum from "react-photo-album"

type Props = {
  works: NonNullable<WorkAwardsQuery["workAwards"]> | null
  title: string
  tooltip?: string
}

export const HomeAwardWorkSection = (props: Props) => {
  if (props.works === null) {
    return null
  }

  const photos = props.works.map((work) => ({
    src: work.work.largeThumbnailImageURL,
    width: work.work.largeThumbnailImageWidth,
    height: work.work.largeThumbnailImageWidth,
    workId: work.work.id, // 各作品のID
    userId: work.work.user.id, // 作品の所有者のID
    userIcon:
      work.work.user?.iconImage?.downloadURL ??
      "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg", // 作品の所有者のアイコン
    userName: work.work.user.name, // 作品の所有者の名前
    workOwnerUserId: work.work.user.id,
    isLiked: work.work.isLiked,
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
            userId={photoProps.photo.userId}
            userName={photoProps.photo.userName}
            userIcon={photoProps.photo.userIcon}
            workId={photoProps.photo.workId}
            workOwnerUserId={photoProps.photo.workOwnerUserId}
            isLiked={photoProps.photo.isLiked}
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
