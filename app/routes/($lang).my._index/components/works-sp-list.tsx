import { Badge } from "~/components/ui/badge"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import type { SortType } from "~/types/sort-type"
import {
  EyeIcon,
  FolderIcon,
  HeartIcon,
  MessageCircle,
  PencilIcon,
} from "lucide-react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { Link } from "@remix-run/react"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof MobileWorkListItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
}

const editUrl = (id: string, workType: string) => {
  if (workType === "WORK") {
    return `/posts/${id}/image/edit`
  }
  if (workType === "VIDEO") {
    return `/posts/${id}/animation/edit`
  }
  if (workType === "COLUMN" || workType === "NOVEL") {
    return `/posts/${id}/text/edit`
  }

  return "/"
}

const postUrl = (work: {
  id: string
  createdAt: number
  accessType: string
  uuid: string | null
}) => {
  if (
    new Date(work.createdAt * 1000).getTime() > new Date().getTime() ||
    work.accessType === "PRIVATE" ||
    work.accessType === "DRAFT"
  ) {
    return `/posts/${work.id}/draft`
  }
  if (work.accessType === "LIMITED") {
    return `/posts/${work.uuid}`
  }
  return `/posts/${work.id}`
}

/**
 * スマホ向け作品一覧
 */
export function WorksSpList(props: Props) {
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  return (
    <>
      {props.works.map((work, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index}>
          <div className="flex border-b">
            <Link to={postUrl(work)}>
              <img
                src={work.smallThumbnailImageURL}
                alt=""
                className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
              />
            </Link>
            <div className="w-full">
              <div className="w-full max-w-40 space-y-4 overflow-hidden text-ellipsis">
                <Link to={postUrl(work)}>
                  <div className="w-full font-bold">
                    {truncateTitle(work.title, 32)}
                  </div>
                </Link>
                <div className="space-x-2">
                  <Badge variant={"secondary"}>
                    {toAccessTypeText(work.accessType)}
                  </Badge>
                  <Badge variant={"secondary"}>
                    {toWorkTypeText(work.type)}
                  </Badge>
                </div>
                <div className="text-sm opacity-80">
                  {toDateTimeText(work.createdAt)}
                </div>
              </div>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="mr-1 h-4 w-4" />
                  {work.bookmarksCount}
                </div>
                <div className="flex items-center">
                  <HeartIcon className="mr-1 h-4 w-4" />
                  {work.likesCount}
                </div>
                <div className="flex items-center">
                  <EyeIcon className="mr-1 h-4 w-4" />
                  {work.viewsCount}
                </div>
              </div>
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {work.commentsCount}
              </div>
            </div>
            <div className="flex w-16 justify-center">
              <Link to={editUrl(work.id, work.type)}>
                <PencilIcon />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export const MobileWorkListItemFragment = graphql(
  `fragment MobileWorkListItem on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    type
    commentsCount
    viewsCount
    likesCount
    bookmarksCount
    createdAt
    accessType
    uuid
  }`,
)
