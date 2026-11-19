import { type FragmentOf, graphql } from "gql.tada"
import { ImagesIcon, LibraryBigIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  albums: FragmentOf<typeof UserAlbumListItemFragment>[]
  /** 見出しの右に出す操作（自分のページの「シリーズを作成」など） */
  action?: ReactNode
}

/**
 * ユーザーページのシリーズ一覧
 * 画面の幅に合わせて 2〜4 列のカードで並べ、題名は画像の下に出す
 * （以前は決まった大きさの画像を詰めて並べ、題名を画像の上に重ねていたので、長い題名が切れて読めなかった）
 */
export function UserAlbumList(props: Props) {
  const t = useTranslation()

  // 作品が 1 つもないシリーズは開いても何もないので出さない
  const albums = props.albums.filter((album) => album.works.length > 0)

  return (
    <section className="flex flex-col gap-4 pb-8">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 font-bold text-lg">
          {t("シリーズ", "Series")}
          {albums.length > 0 && (
            <span className="font-medium text-muted-foreground text-sm tabular-nums">
              {t(`${albums.length}件`, `${albums.length}`)}
            </span>
          )}
        </h2>
        {props.action}
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-16 text-center">
          <LibraryBigIcon className="size-8 text-muted-foreground" />
          <p className="font-bold text-sm">
            {t("シリーズはまだありません", "No series yet")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "シリーズは、作品をまとめて順番に見られるようにしたものです",
              "A series groups works so they can be viewed in order",
            )}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
          {albums.map((album) => {
            const imageUrl =
              album.thumbnailImageURL ?? album.works[0]?.smallThumbnailImageURL
            return (
              <li key={album.id} className="min-w-0">
                <Link
                  to={`/${album.user.login}/albums/${album.slug}`}
                  className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                    {imageUrl && (
                      <img
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                        src={imageUrl}
                        alt={album.title}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    {album.worksCount > 0 && (
                      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-bold text-white text-xs tabular-nums backdrop-blur-sm">
                        <ImagesIcon className="size-3" />
                        {album.worksCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 px-0.5">
                    <p className="line-clamp-2 break-words font-bold text-sm leading-snug group-hover:underline">
                      {album.title}
                    </p>
                    <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                      {t(
                        `${album.worksCount.toLocaleString()}作品`,
                        `${album.worksCount.toLocaleString()} works`,
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export const UserAlbumListItemFragment = graphql(
  `fragment UserAlbumListItem on AlbumNode @_unmask {
    id
    thumbnailImageURL
    slug
    worksCount
    title
    user {
      login
    }
    works(limit: 1, offset: 0) {
      smallThumbnailImageURL
    }
  }`,
)
