import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { Link } from "@remix-run/react"
import { EyeIcon, FolderIcon, HeartIcon, MessageCircle } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof MobileRecommendedWorkItemFragment>[]
}

/**
 * スマホ向け推薦作品一覧
 */
export function RecommendedWorksSpList(props: Props) {
  return (
    <>
      {props.works.map((work, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index}>
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
                  <div className="w-full font-bold">{work.title}</div>
                </Link>
                <Badge variant={"secondary"}>
                  {toAccessTypeText(work.accessType)}
                </Badge>
                <div className="text-sm opacity-80">{work.createdAt}</div>
              </div>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="mr-1 size-4" />
                  {work.bookmarksCount}
                </div>
                <div className="flex items-center">
                  <HeartIcon className="mr-1 size-4" />
                  {work.likesCount}
                </div>
                <div className="flex items-center">
                  <EyeIcon className="mr-1 size-4" />
                  {work.viewsCount}
                </div>
              </div>
              <div className="flex items-center">
                <MessageCircle className="mr-1 size-4" />
                {work.commentsCount}
              </div>
            </div>
          </div>
          <Separator />
        </div>
      ))}
    </>
  )
}

export const MobileRecommendedWorkItemFragment = graphql(
  `fragment MobileRecommendedWorkItem on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    accessType
    createdAt
    bookmarksCount
    likesCount
    viewsCount
    commentsCount
  }`,
)
