import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { XIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type Props = {
  name: string
  onClick(): void
}

/**
 * お気に入りタグのカード。新しい作品を見せて、どんなタグか分かるようにする
 */
export function FollowedTag(props: Props) {
  const t = useTranslation()
  const viewerRatings = useViewerRatings()

  const { data, loading } = useQuery(followedTagLatestWorksQuery, {
    skip: !viewerRatings.isReady,
    fetchPolicy: "cache-first",
    variables: {
      where: {
        tagNames: [props.name],
        ratings: viewerRatings.normalRatings,
        isNowCreatedAt: true,
      },
    },
  })

  const works = data?.tagWorks ?? []

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <Link to={`/tags/${encodeURIComponent(props.name)}`} className="block">
        <div className="grid h-24 grid-cols-3 gap-px overflow-hidden bg-muted">
          {[0, 1, 2].map((index) =>
            works[index] ? (
              <img
                key={works[index].id}
                src={toResizedImageUrl(
                  works[index].smallThumbnailImageURL,
                  240,
                )}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-24 w-full object-cover object-top"
              />
            ) : (
              <div key={index} className="bg-muted" />
            ),
          )}
        </div>
        <p className="truncate px-3 py-2 font-bold text-sm">
          <span className="text-muted-foreground">#</span>
          {props.name}
          {!loading && works.length === 0 && (
            <span className="ml-2 font-normal text-muted-foreground text-xs">
              {t("まだ作品がありません", "No works yet")}
            </span>
          )}
        </p>
      </Link>
      <button
        type="button"
        onClick={props.onClick}
        aria-label={t(`#${props.name} を解除`, `Remove #${props.name}`)}
        title={t("解除", "Remove")}
        className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

const followedTagLatestWorksQuery = graphql(
  `query FollowedTagLatestWorks($where: WorksWhereInput!) {
    tagWorks(limit: 3, offset: 0, where: $where) {
      id
      smallThumbnailImageURL
    }
  }`,
)
