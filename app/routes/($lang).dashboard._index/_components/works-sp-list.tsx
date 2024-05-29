import { Badge } from "@/_components/ui/badge"
import { Separator } from "@/_components/ui/separator"
import {} from "@/_components/ui/table"
import type { WorkAccessType } from "@/_types/work-access-type"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import type { SortType } from "@/_types/sort-type"
import type { WorksOrderby } from "@/routes/($lang).dashboard._index/_types/works-orderby"
import {
  EyeIcon,
  FolderIcon,
  HeartIcon,
  MessageCircle,
  PencilIcon,
} from "lucide-react"

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
    accessType: WorkAccessType
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: WorksOrderby
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickDateSortButton: () => void
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
            <a href={`/works/${work.id}`} className="mr-2">
              <img
                src={work.thumbnailImageUrl}
                alt=""
                className="mr-4 h-[72px] w-[72px] rounded-md object-cover"
              />
            </a>
            <div className="w-full space-y-2">
              <div className="w-full space-y-2">
                <a href={`/works/${work.id}`}>
                  <div className="w-full font-bold">{work.title}</div>
                </a>
                <Badge variant={"secondary"}>
                  {toAccessTypeText(work.accessType)}
                </Badge>
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
              <a href={`https://aipictors.com/edit-work/?id=${work.id}`}>
                <PencilIcon />
              </a>
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </>
  )
}
