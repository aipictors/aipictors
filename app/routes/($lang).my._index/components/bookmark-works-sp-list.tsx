import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { Link } from "react-router";
import { EyeIcon, FolderIcon, HeartIcon, MessageCircle } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  works: FragmentOf<typeof BookmarkWorksSpListItemFragment>[]
}

/**
 * スマホ向けブックマーク作品一覧
 */
export function BookmarkWorksSpList(props: Props) {
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  return (<>
    {props.works.map((work, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      (<div key={index}>
        <div className="mt-2 mb-2 flex">
          <Link to={`/posts/${work.id}`} className="mr-2">
            <img
              src={work.smallThumbnailImageURL}
              alt=""
              className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
            />
          </Link>
          <div className="w-full space-y-2">
            <div className="w-full space-y-2">
              <Link to={`/posts/${work.id}`}>
                <div className="w-full font-bold">
                  {truncateTitle(work.title, 32)}
                </div>
              </Link>
              <Badge variant={"secondary"}>
                {toAccessTypeText(work.accessType)}
              </Badge>
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
        </div>
        <Separator />
      </div>)
    ))}
  </>);
}

export const BookmarkWorksSpListItemFragment = graphql(
  `fragment BookmarkWorksSpListItem on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    likesCount
    bookmarksCount
    commentsCount
    viewsCount
    accessType
    createdAt
  }`,
)
