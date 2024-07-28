import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { Link } from "@remix-run/react"
import { EyeIcon, FolderIcon, HeartIcon, MessageCircle } from "lucide-react"

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
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }[]
}

/**
 * スマホ向けブックマーク作品一覧
 */
export const BookmarkWorksSpList = (props: Props) => {
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
          </div>
          <Separator />
        </div>
      ))}
    </>
  )
}
