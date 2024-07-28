import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoWorksAlbum = (props: Props) => {
  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work) => ({
          ket: work.id,
          src: work.largeThumbnailImageURL,
          width: work.largeThumbnailImageWidth,
          height: work.largeThumbnailImageHeight,
          workId: work.id, // 各作品のID
          userId: work.user.id, // 作品の所有者のID
          userIcon: IconUrl(work.user?.iconUrl), // 作品の所有者のアイコン
          userName: work.user.name, // 作品の所有者の名前
          workOwnerUserId: work.user.id,
          isLiked: work.isLiked,
          title: work.title,
          isSensitive: work.rating === "R18" || work.rating === "R18G",
          subWorksCount: work.subWorksCount,
          to: `/posts/${work.id}`,
          href: `/posts/${work.id}`,
        }))}
        targetRowHeight={
          props.targetRowHeight !== undefined ? props.targetRowHeight : 240
        }
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        componentsProps={{
          // @ts-ignore
          link: (props) => <Link {...props} />,
        }}
        render={{
          // TODO: コンポーネントを分ける
          extras: (_, { photo, index }) => (
            // typeof window === "undefined" ? (
            //   <div className="mt-2 flex flex-col space-y-2">
            //     <Skeleton className="h-4 w-full rounded-full" />
            //     <div className="flex items-center space-x-2">
            //       <Skeleton className="h-4 w-4 rounded-full" />
            //       <Skeleton className="h-4 w-full rounded-full" />
            //     </div>
            //   </div>
            // ) : (
            <div key={index}>
              <div className="absolute right-1 bottom-12 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.workId}
                  targetWorkOwnerUserId={photo.userId}
                  defaultLiked={photo.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                <Link className="w-48 font-bold" to={`/posts/${photo.workId}`}>
                  <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
                    {photo.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.userId}`}>
                  <div className="flex items-center space-x-2">
                    <img
                      src={IconUrl(photo.userIcon)}
                      alt={photo.userName}
                      className="h-4 w-4 rounded-full"
                    />
                    <span className="text-nowrap font-bold text-sm ">
                      {photo.userName}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          ),
          // ),
        }}
      />
    </SSR>
  )
}
