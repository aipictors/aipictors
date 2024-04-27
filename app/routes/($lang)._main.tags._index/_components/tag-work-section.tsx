import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { HomeWorkAlbum } from "@/routes/($lang)._main._index/_components/home-work-album"
import PhotoAlbum from "react-photo-album"

type Props = {
  works: NonNullable<WorksQuery["works"]>
  title: string
}

export const TagWorkSection = (props: Props) => {
  // 各作品のデータを変換
  const photos = props.works.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
  }))

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h2 className="items-center space-x-2 font-bold text-2xl">
          {props.title}
        </h2>
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
