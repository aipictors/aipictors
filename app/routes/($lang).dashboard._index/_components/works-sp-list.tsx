import { Badge } from "@/_components/ui/badge"
import { Separator } from "@/_components/ui/separator"
import {} from "@/_components/ui/table"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import type { SortType } from "@/_types/sort-type"
import {
  EyeIcon,
  FolderIcon,
  HeartIcon,
  MessageCircle,
  PencilIcon,
} from "lucide-react"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toWorkTypeText } from "@/_utils/work/to-work-type-text"
import { Link } from "@remix-run/react"

type Props = {
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    workType: IntrospectionEnum<"WorkType">
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
}

/**
 * スマホ向け作品一覧
 */
export const WorksSpList = (props: Props) => {
  return (
    <>
      {props.works.map((work, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index}>
          <div className="mt-2 mb-2 flex">
            <Link to={`/posts/${work.id}`} className="mr-2">
              <img
                src={work.thumbnailImageUrl}
                alt=""
                className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
              />
            </Link>
            <div className="w-full space-y-2">
              <div className="w-full space-y-2">
                <Link to={`/posts/${work.id}`}>
                  <div className="w-full font-bold">{work.title}</div>
                </Link>
                <div className="space-x-2">
                  <Badge variant={"secondary"}>
                    {toAccessTypeText(work.accessType)}
                  </Badge>
                  <Badge variant={"secondary"}>
                    {toWorkTypeText(work.workType)}
                  </Badge>
                </div>
                <div className="text-sm opacity-80">{work.createdAt}</div>
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
              <Link to={`/posts/${work.id}/edit`}>
                <PencilIcon />
              </Link>
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </>
  )
}
