import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { useNavigate } from "@remix-run/react"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { tagWorksQuery } from "~/routes/($lang)._main.tags.$tag._index/route"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { TagFollowButton } from "~/components/button/tag-follow-button"
import { TagActionOther } from "~/routes/($lang)._main.tags._index/components/tag-action-other"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  worksCount: number
  tag: string
  page: number
  isSensitive: boolean
}

export function TagWorkSection(props: Props) {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const {
    data: resp,
    loading,
    error,
  } = useQuery(tagWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        search: props.tag,
        orderBy: "LIKES_COUNT",
        isSensitive: props.isSensitive,
      },
    },
  })

  const works = resp?.works ?? props.works

  const firstWork = works.length ? works[0] : null

  return (
    <div className="flex flex-col space-y-6">
      <div className="relative h-32">
        {firstWork?.smallThumbnailImageURL && (
          <div className="relative h-16 w-full overflow-hidden">
            <img
              src={firstWork.smallThumbnailImageURL}
              alt={`${props.tag}のサムネイル`}
              className="h-full w-full object-cover opacity-50"
            />
          </div>
        )}
        <div className="absolute top-8 left-0">
          <div className="flex space-x-4">
            <div className="rounded-md border-2 border-white">
              {firstWork && (
                <CroppedWorkSquare
                  workId={firstWork.id}
                  imageUrl={firstWork.smallThumbnailImageURL}
                  thumbnailImagePosition={firstWork.thumbnailImagePosition ?? 0}
                  size="sm"
                  imageWidth={firstWork.smallThumbnailImageWidth}
                  imageHeight={firstWork.smallThumbnailImageHeight}
                />
              )}
            </div>
            <h1 className="mt-auto font-bold text-md">
              <p>#{props.tag}の作品</p>
              <p>{props.worksCount}件</p>
            </h1>
          </div>
        </div>
      </div>
      <div className="ml-auto flex w-full items-center space-x-4 md:w-64">
        <TagFollowButton className="w-full" tag={props.tag} isFollow={false} />
        <TagActionOther isSensitive={props.isSensitive} tag={props.tag} />
      </div>
      <ResponsivePhotoWorksAlbum works={works} />
      <ResponsivePagination
        maxCount={Number(props.worksCount)}
        perPage={32}
        currentPage={props.page}
        onPageChange={(page: number) => {
          navigate(`/tags/${props.tag}/?page=${page}`)
        }}
      />
    </div>
  )
}
