import { useApolloClient } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { FolderHeartIcon, ImagesIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  folders: FragmentOf<typeof UserUserFoldersItemFragment>[]
  /** 続きを読むときのユーザー ID（ないときは「もっと見る」を出さない） */
  userId?: string
  /** 1 回に読む件数（loader と同じ数。これより少なく返ったら続きはない） */
  pageSize?: number
}

/**
 * ユーザーページのコレクション一覧
 * シリーズ一覧と同じく、画面の幅に合わせて 2〜4 列のカードで並べ、題名と作品数は画像の下に出す
 * （以前はスマホで 128×64px の小さな画像を詰めて並べ、題名を画像に重ねていたので、題名が切れて読めず押しにくかった）
 */
export function UserCollectionList(props: Props) {
  const t = useTranslation()
  const apolloClient = useApolloClient()
  const pageSize = props.pageSize ?? 32

  const [folders, setFolders] = useState(props.folders)
  const [hasMore, setHasMore] = useState(props.folders.length >= pageSize)
  const [isLoading, setIsLoading] = useState(false)

  // 別のユーザーのページへ移ったときは読み直した一覧に戻す
  useEffect(() => {
    setFolders(props.folders)
    setHasMore(props.folders.length >= pageSize)
  }, [props.folders, pageSize])

  const onLoadMore = async () => {
    if (props.userId === undefined || isLoading) {
      return
    }
    setIsLoading(true)
    try {
      const resp = await apolloClient.query({
        query: userFoldersMoreQuery,
        variables: {
          userId: props.userId,
          offset: folders.length,
          limit: pageSize,
        },
      })
      const next = resp.data.user?.folders ?? []
      setFolders((prev) => {
        const ids = new Set(prev.map((folder) => folder.id))
        return [...prev, ...next.filter((folder) => !ids.has(folder.id))]
      })
      setHasMore(next.length >= pageSize)
    } catch (error) {
      console.error("Error loading collections", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 作品が 1 つもないコレクション（自動で作られた空のものなど）は開いても何もないので出さない
  const visibleFolders = folders.filter((folder) => folder.works.length > 0)

  return (
    <section className="flex flex-col gap-4 pb-8">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 font-bold text-lg">
          {t("コレクション", "Collections")}
          {visibleFolders.length > 0 && (
            <span className="font-medium text-muted-foreground text-sm tabular-nums">
              {t(
                `${visibleFolders.length}${hasMore ? "+" : ""}件`,
                `${visibleFolders.length}${hasMore ? "+" : ""}`,
              )}
            </span>
          )}
        </h2>
      </div>

      {visibleFolders.length === 0 && !hasMore ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-16 text-center">
          <FolderHeartIcon className="size-8 text-muted-foreground" />
          <p className="font-bold text-sm">
            {t("コレクションはまだありません", "No collections yet")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "コレクションは、好きな作品を集めてまとめたものです",
              "A collection gathers favorite works in one place",
            )}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
          {visibleFolders.map((folder) => {
            const imageUrl =
              folder.thumbnailImageURL ||
              folder.works[0]?.smallThumbnailImageURL
            const worksCount = folder.worksCount ?? 0
            return (
              <li key={folder.id} className="min-w-0">
                <Link
                  to={`/collections/${folder.nanoid}`}
                  className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                    {imageUrl ? (
                      <img
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                        src={imageUrl}
                        alt={folder.title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <FolderHeartIcon
                          className="size-8"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    {worksCount > 0 && (
                      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-bold text-white text-xs tabular-nums backdrop-blur-sm">
                        <ImagesIcon className="size-3" aria-hidden="true" />
                        {worksCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 px-0.5">
                    <p className="line-clamp-2 break-words font-bold text-sm leading-snug group-hover:underline">
                      {folder.title || t("無題のコレクション", "Untitled")}
                    </p>
                    {worksCount > 0 && (
                      <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                        {t(
                          `${worksCount.toLocaleString()}作品`,
                          `${worksCount.toLocaleString()} works`,
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {hasMore && props.userId !== undefined && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            className="h-11 min-w-48 rounded-full"
            disabled={isLoading}
            onClick={onLoadMore}
          >
            {isLoading && <Loader2Icon className="size-4 animate-spin" />}
            {t("もっと見る", "Load more")}
          </Button>
        </div>
      )}
    </section>
  )
}

export const UserUserFoldersItemFragment = graphql(
  `fragment UserUserFoldersItem on FolderNode @_unmask {
    id
    thumbnailImageURL
    worksCount
    title
    nanoid
    user {
      login
    }
    works(limit: 1, offset: 0) {
      smallThumbnailImageURL
    }
  }`,
)

const userFoldersMoreQuery = graphql(
  `query UserFoldersMore($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      folders(offset: $offset, limit: $limit) {
        ...UserUserFoldersItem
      }
    }
  }`,
  [UserUserFoldersItemFragment],
)
