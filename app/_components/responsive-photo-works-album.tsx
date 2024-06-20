import type { worksQuery } from "@/_graphql/queries/work/works"
import { config } from "@/config"
import { HomeWorkAlbum } from "@/routes/($lang)._main._index/_components/home-work-album"
import type { ResultOf } from "gql.tada"
import PhotoAlbum from "react-photo-album"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  works: NonNullable<ResultOf<typeof worksQuery>["works"]> | null
  targetRowHeight?: number
  direction?: "rows" | "columns"
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoWorksAlbum = (props: Props) => {
  if (props.works === null || props.works.length === 0) {
    return null
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const photos = props.works.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
    userId: work.user.id, // 作品の所有者のID
    userIcon:
      work.user?.iconUrl ??
      "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg", // 作品の所有者のアイコン
    userName: work.user.name, // 作品の所有者の名前
    workOwnerUserId: work.user.id,
    isLiked: work.isLiked,
    title: work.title,
  }))

  return (
    <PhotoAlbum
      layout={
        !props.direction ? (isDesktop ? "rows" : "columns") : props.direction
      }
      columns={2}
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
          workTitle={photoProps.photo.title}
        />
      )}
      defaultContainerWidth={120}
      targetRowHeight={
        props.targetRowHeight !== undefined ? props.targetRowHeight : 240
      }
      sizes={{
        size: "calc(100vw - 240px)",
        sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
      }}
    />
  )
}
