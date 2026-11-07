import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useContext } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  type: "FOLLOW_USER" | "FOLLOW_TAG"
  title: string
  link: string
}

/**
 * おすすめの途中に差し込む棚（フォロー新着・お気に入りタグ新着の新しい作品を横に並べる）
 * 中身が無ければ何も出さない
 */
export function RecommendedFeedShelf(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data } = useQuery(feedShelfQuery, {
    skip: !authContext.isLoggedIn || !authContext.userId,
    variables: {
      feedWhere: { userId: authContext.userId ?? "", type: props.type },
      postsWhere: { ratings: ["G", "R15"] },
    },
  })

  const works = (data?.feed?.posts ?? [])
    .map((post) => post.work)
    .filter((work) => work !== null && work !== undefined)

  if (works.length === 0) return null

  return (
    <section className="space-y-2 rounded-2xl border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm">{props.title}</h2>
        <Link
          to={props.link}
          className="flex items-center text-muted-foreground text-xs hover:text-foreground"
        >
          {t("すべて見る", "See all")}
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {works.map((work) => (
          <div key={work.id} className="w-28 shrink-0 sm:w-36">
            <CroppedWorkSquare
              workId={work.id}
              title={work.title}
              imageUrl={work.smallThumbnailImageURL}
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              subWorksCount={work.subWorksCount}
              commentsCount={work.commentsCount}
              size="auto"
              displayWidth="144px"
              isPromptPublic={false}
              hasVideoUrl={Boolean(work.url || work.streamUid)}
            />
            <p className="mt-1 truncate text-xs">{work.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const feedShelfQuery = graphql(
  `query RecommendedFeedShelf($feedWhere: FeedWhereInput!, $postsWhere: FeedPostsWhereInput) {
    feed(where: $feedWhere) {
      posts(limit: 12, offset: 0, where: $postsWhere) {
        id
        work {
          ...PhotoAlbumWork
        }
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)
