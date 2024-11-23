import { Badge } from "~/components/ui/badge"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import type { SortType } from "~/types/sort-type"
import {
  EllipsisIcon,
  EyeIcon,
  FolderIcon,
  HeartIcon,
  MessageCircle,
  PencilIcon,
} from "lucide-react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { Link } from "react-router";
import { toDateTimeText } from "~/utils/to-date-time-text"
import { type FragmentOf, graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/hooks/use-locale"
import { DeleteConfirmTrashDialog } from "~/routes/($lang).my._index/components/delete-confirm-trash-dialog"
import { CroppedMyWorkSquare } from "~/routes/($lang).my._index/components/cropped-my-work-square"

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

  const [deleteWork, { loading: isLoadingDeleteWork }] =
    useMutation(deleteWorkMutation)

  const [deletedIds, setDeletedIds] = useState<string[]>([])

  const onDeleteWork = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
        },
      },
    })
    toast("作品を削除しました")

    setDeletedIds([...deletedIds, workId])
  }

  const location = useLocale()

  return (<>
    {props.works
      .filter((work) => !deletedIds.includes(work.id))
      .map((work, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        (<div key={index} className="flex flex-col">
          <div className="flex space-x-4 border-b pt-2 pb-2">
            <Link to={postUrl(work)}>
              <CroppedMyWorkSquare
                workId={work.id}
                imageUrl={work.smallThumbnailImageURL}
                size="sm"
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
              />
            </Link>
            <div className="flex w-full flex-col space-y-2">
              <div className="w-full max-w-64 space-y-2 overflow-hidden text-ellipsis">
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
                    {toWorkTypeText({
                      type: work.type,
                      lang: location,
                    })}
                  </Badge>
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
              <div className="text-sm opacity-80">
                {toDateTimeText(work.createdAt)}
              </div>
            </div>
            <div className="flex h-8 items-center">
              <div className="flex w-16 justify-center">
                <Link to={editUrl(work.id, work.type)}>
                  <PencilIcon />
                </Link>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size={"icon"} variant="secondary">
                    <EllipsisIcon className="w-16" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="flex justify-center">
                    <DeleteConfirmTrashDialog
                      onDelete={async () => {
                        await onDeleteWork(work.id)
                      }}
                      workTitle={work.title}
                      isLoadingDeleteWork={isLoadingDeleteWork}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>)
      ))}
  </>);
}

export const MobileWorkListItemFragment = graphql(
  `fragment MobileWorkListItem on WorkNode @_unmask {
    id
    uuid
    title
    type
    commentsCount
    viewsCount
    smallThumbnailImageURL
    likesCount
    rating
    bookmarksCount
    createdAt
    accessType
    uuid
    isPromotion
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    thumbnailImagePosition
  }`,
)

const deleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)
