import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ChevronRightIcon, HeartIcon } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  onSelect?: (workId: string) => void
}

/**
 * 「ユーザからの推薦」を横に並べる（おすすめの一番上。縦に場所を取らないように 1 列で横に流す）
 */
export function HomePromotionStrip(props: Props) {
  const t = useTranslation()

  const { data } = useQuery(promotionStripQuery, {
    variables: {
      where: { isRecommended: true, sort: "DESC", ratings: ["G", "R15"] },
    },
  })

  const works = data?.works ?? []

  return (
    // 読み込むまでも高さを取っておく（下のおすすめがずれないように）
    <section className="min-h-[13.5rem] space-y-2 sm:min-h-[15.5rem]">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base">
          {t("ユーザからの推薦", "Recommended by users")}
        </h2>
        <Link
          to="/home/recommended"
          className="flex items-center text-muted-foreground text-xs hover:text-foreground"
        >
          {t("推薦作品をもっと見る", "All recommended")}
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {works.map((work, index) => (
          <div key={work.id} className="w-36 shrink-0 snap-start sm:w-44">
            <CroppedWorkSquare
              workId={work.id}
              title={t.workTitle(work.title, work.enTitle)}
              imageUrl={work.smallThumbnailImageURL}
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              subWorksCount={work.subWorksCount}
              commentsCount={work.commentsCount}
              size="auto"
              displayWidth="(min-width: 640px) 176px, 144px"
              isPriority={index < 2}
              isPromptPublic={false}
              hasVideoUrl={Boolean(work.url || work.streamUid)}
              onSelect={props.onSelect}
            />
            <p className="mt-1 truncate font-bold text-xs">
              {t.workTitle(work.title, work.enTitle)}
            </p>
            <p className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
              <span className="truncate">{work.user?.name}</span>
              <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
                <HeartIcon className="size-3 fill-current" />
                {work.likesCount}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const promotionStripQuery = graphql(
  `query HomePromotionStrip($where: WorksWhereInput) {
    works(offset: 0, limit: 16, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
