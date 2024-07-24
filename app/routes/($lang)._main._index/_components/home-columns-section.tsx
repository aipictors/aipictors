import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { NovelWorkPreviewItem } from "@/_components/novel-work-preview-item"
import { UserNameBadge } from "@/_components/user-name-badge"
import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { WORK_COUNT_DEFINE } from "@/routes/($lang)._main._index/route"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  title: string
  isSensitive?: boolean
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * 小説作品一覧
 */
export const HomeColumnsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: novelWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: WORK_COUNT_DEFINE.NOVEL_WORKS,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "COLUMN",
      },
    },
  })

  const workDisplayed = novelWorks?.works ?? props.works

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
      </div>
      <CarouselWithGradation
        items={
          workDisplayed?.map((work, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="rounded border-2 border-gray border-solid"
            >
              <div className="relative">
                <NovelWorkPreviewItem
                  workId={work.id}
                  imageUrl={work.largeThumbnailImageURL}
                  title={work.title}
                  text={work.description ?? ""}
                />
              </div>
              <UserNameBadge
                userId={work.user.id}
                userIconImageURL={IconUrl(work.user.iconUrl)}
                name={work.user.name}
                width={"lg"}
                padding={"md"}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.user.id}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>
          )) || []
        }
      />
    </section>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
