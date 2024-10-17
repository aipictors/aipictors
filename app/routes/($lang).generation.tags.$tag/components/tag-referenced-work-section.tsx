import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof TagWorkFragment>[]
  title: string
}

/**
 * レスポンシブ対応の作品一覧
 */
export function TagReferencedWorkSection(props: Props) {
  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work) => ({
          src: work.largeThumbnailImageURL,
          width: work.largeThumbnailImageWidth,
          height: work.largeThumbnailImageHeight,
          workId: work.id, // 各作品のID
          userId: work.user.id, // 作品の所有者のID
          userIcon: withIconUrlFallback(work.user?.iconUrl), // 作品の所有者のアイコン
          userName: work.user.name, // 作品の所有者の名前
          workOwnerUserId: work.user.id,
          isLiked: work.isLiked,
          title: work.title,
          isSensitive: work.rating === "R18" || work.rating === "R18G",
          subWorksCount: work.subWorksCount,
          to: `/posts/${work.id}`,
          href: `/posts/${work.id}`,
        }))}
        targetRowHeight={240}
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        componentsProps={{
          // @ts-ignore
          link: (props) => <Link {...props} />,
        }}
        render={{
          extras: (_, { photo, index }) => (
            // typeof window === "undefined" ? null : (
            <div key={index}>
              <div className="absolute right-1 bottom-16 z-10">
                <LikeButton
                  size={56}
                  key={index}
                  targetWorkId={photo.workId}
                  targetWorkOwnerUserId={photo.userId}
                  defaultLiked={photo.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden">
                <Link className="w-48 font-bold" to={`/posts/${photo.workId}`}>
                  <p className="overflow-hidden truncate text-nowrap text-base text-white">
                    {photo.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.userId}`}>
                  <div className="flex items-center space-x-2">
                    <img
                      src={withIconUrlFallback(photo.userIcon)}
                      alt={photo.userName}
                      className="h-6 w-6 rounded-full"
                    />
                    <p className="text-nowrap text-sm text-white">
                      {photo.userName}
                    </p>
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

export const TagWorkFragment = graphql(
  `fragment TagWork on WorkNode @_unmask {
    id
    title
    steps
    sampler
    scale
    vae
    prompt
    negativePrompt
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    rating
    subWorksCount
    isLiked
    user {
      id
      iconUrl
      name
    }
  }`,
)
