import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

/**
 * ランキング一覧
 */
export function HomeAwardWorksSection (props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-bold text-xl">
        {t("前日ランキング", "Yesterday's ranking")}
      </h2>
      {props.works.map(
        (work, index) =>
          work && (
            <div
              key={index.toString()}
              className="relative flex items-center space-x-2 opacity-80"
            >
              <div className="flex h-full items-center space-x-2">
                <CroppedWorkSquare
                  workId={work.work?.id ?? ""}
                  imageUrl={work.work?.smallThumbnailImageURL ?? ""}
                  thumbnailImagePosition={
                    work.work?.thumbnailImagePosition ?? 0
                  }
                  size="sm"
                  imageWidth={work.work?.smallThumbnailImageWidth ?? 0}
                  imageHeight={work.work?.smallThumbnailImageHeight ?? 0}
                />
                <div className="flex flex-col space-y-2">
                  <Link to={`/posts/${work.work?.id}`}>
                    <p className="font-semibold">{work.work?.title}</p>
                  </Link>
                  {work.work?.user && (
                    <Link to={`/users/${work.work?.user.id}`}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="size-8">
                          <AvatarImage
                            className="size-8 rounded-full"
                            src={withIconUrlFallback(work.work?.user?.iconUrl)}
                            alt="icon"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <p>{work.work?.user?.name}</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
              <div className="absolute top-1 left-0 size-4 items-center rounded-full bg-white text-center font-semibold text-xs dark:text-black">
                <p>{index + 1}</p>
              </div>
            </div>
          ),
      )}
    </div>
  )
}

export const HomeAwardWorksFragment = graphql(
  `fragment HomeAwardWorks on WorkAwardNode @_unmask {
    work {
      id
      smallThumbnailImageURL
      smallThumbnailImageHeight
      smallThumbnailImageWidth
      thumbnailImagePosition
      title
      user {
        id
        iconUrl
        name
      }
    }
    index
  }`,
)

export const homeAwardWorksQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      id
      ...HomeAwardWorks
    }
  }`,
  [HomeAwardWorksFragment],
)
