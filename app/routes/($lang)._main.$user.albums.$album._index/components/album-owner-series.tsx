import { useQuery } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  PublicAlbumList,
  PublicAlbumListItemFragment,
} from "~/components/album/public-album-list"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  albumId: string
  ownerUserId: string
  ownerLogin: string
  ownerName: string
  isAdultSeries: boolean
}

/**
 * 同じ作者のほかのシリーズ。
 * 一覧の下なので、近くまでスクロールしてから読む
 */
export function AlbumOwnerSeries(props: Props) {
  const t = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (ref.current === null) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: "400px" },
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  const { data } = useQuery(query, {
    skip: !isNear,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        ownerUserId: props.ownerUserId,
        ratings: props.isAdultSeries ? ["R18", "R18G"] : ["G", "R15"],
        needInspected: false,
      },
    },
  })

  const albums = (data?.albums ?? [])
    .filter((album) => album.id !== props.albumId)
    .slice(0, 4)

  return (
    <div ref={ref}>
      {albums.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate font-bold text-lg">
              {t(
                `${props.ownerName}さんのほかのシリーズ`,
                `More series by ${props.ownerName}`,
              )}
            </h2>
            <Link
              to={`${props.isAdultSeries ? "/r" : ""}/users/${props.ownerLogin}/albums`}
              className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
            >
              {t("すべて見る", "See all")}
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <PublicAlbumList albums={albums} />
        </section>
      )}
    </div>
  )
}

const query = graphql(
  `query AlbumOwnerSeries($offset: Int!, $limit: Int!, $where: AlbumsWhereInput!) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PublicAlbumListItem
    }
  }`,
  [PublicAlbumListItemFragment],
)
