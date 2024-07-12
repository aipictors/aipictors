import { ResponsivePagination } from "@/_components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"
import { Card, CardHeader, CardContent } from "@/_components/ui/card"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { graphql, type ResultOf } from "gql.tada"
import { useNavigate } from "@remix-run/react"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

type Props = {
  appEvent: ResultOf<typeof appEventQuery>["appEvent"]
  works: ResultOf<typeof worksQuery>["works"]
  worksCount: ResultOf<typeof worksCountQuery>["worksCount"]
  page: number
}

export const EventPage = (props: Props) => {
  const navigate = useNavigate()

  if (
    !props.appEvent?.title ||
    !props.appEvent?.thumbnailImageUrl ||
    !props.appEvent?.tag ||
    !props.appEvent?.description ||
    !props.appEvent?.startAt ||
    !props.appEvent?.endAt
  )
    return null

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Card className="m-auto max-w-96">
        <CardHeader>
          <div className="flex flex-col items-center">
            <img
              className="h-auto w-full rounded-lg object-cover"
              src={props.appEvent.thumbnailImageUrl}
              alt=""
            />
            <div className="mt-4 font-medium text-lg">
              {props.appEvent.title}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm">{props.appEvent.description}</div>
            <div className="text-sm">
              {toDateTimeText(props.appEvent.startAt)}～
              {toDateTimeText(props.appEvent.endAt)}
            </div>
            <div className="mt-2 text-sm">
              <span>応募作品数: {props.worksCount}</span>
            </div>
            <div className="mt-2 text-sm">
              <span>参加タグ: {props.appEvent.tag}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <ResponsivePhotoWorksAlbum works={props.works} />
      <ResponsivePagination
        maxCount={props.worksCount}
        perPage={64}
        currentPage={props.page}
        onPageChange={(page: number) => {
          navigate(`/events/${props.appEvent?.slug}?page=${page}`)
        }}
      />
    </div>
  )
}

export const appEventQuery = graphql(
  `query AppEvent($slug: String!) {
    appEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
    }
  }`,
)

export const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
