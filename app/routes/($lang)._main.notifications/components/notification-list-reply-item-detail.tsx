import { Badge } from "~/components/ui/badge"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { toDateText } from "~/lib/app/utils/to-date-text"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "~/components/ui/table" // shadcn/ui のテーブルコンポーネントをインポート
import { ReplyIcon } from "lucide-react"

type Props = {
  notification: FragmentOf<typeof WorkCommentReplyNotificationFragment>
  stickerSize?: "xl" | "lg" | "md" | "sm" | "xs"
}

const stickerSizeClasses = {
  xl: "size-24 md:h-32 md:w-32",
  lg: "size-20 md:h-24 md:w-24",
  md: "size-12",
  sm: "size-8",
  xs: "size-6",
}

/**
 * 返信のお知らせ内容をテーブル行として表示
 */
export function NotificationListReplyItemDetail(props: Props) {
  const stickerClass = props.stickerSize
    ? stickerSizeClasses[props.stickerSize]
    : stickerSizeClasses.md

  const originalComment = props.notification.comment

  const reply = props.notification

  if (props.notification.work == null) {
    return null
  }

  return (
    <div className="mb-4 overflow-hidden rounded-md border-2 border-gray-300 dark:border-gray-600">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-white dark:bg-zinc-800">
            {/* 左列: サムネイル */}
            <TableCell className="w-1/4 p-4 md:w-1/5">
              <Link to={`/posts/${props.notification.work?.id}`}>
                <img
                  src={props.notification.work?.smallThumbnailImageURL}
                  alt="thumbnail"
                  className="size-24 rounded-md object-cover"
                />
              </Link>
            </TableCell>

            {/* 中央列: 返信情報 */}
            {originalComment && (
              <TableCell className="w-2/4 p-4 md:w-3/5">
                <Link
                  to={`/posts/${originalComment.work?.id}`}
                  className="block rounded-md p-2 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Link to={`/users/${originalComment.user?.id}`}>
                      <Avatar className="size-8">
                        <AvatarImage
                          src={withIconUrlFallback(
                            originalComment.user?.iconUrl,
                          )}
                          alt="user icon"
                          className="size-8 rounded-full object-cover"
                        />
                        <AvatarFallback />
                      </Avatar>
                    </Link>
                    <span className="font-medium">
                      {originalComment.user?.name}のコメント
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {originalComment.text.length > 0 && (
                      <>「{originalComment.text}」</>
                    )}
                  </p>
                  {originalComment?.sticker?.imageUrl && (
                    <img
                      src={originalComment.sticker?.imageUrl}
                      alt="sticker"
                      className={cn(stickerClass, "mt-2")}
                    />
                  )}
                </Link>
              </TableCell>
            )}
            {/* 右列: 詳細情報 */}
            <TableCell className="w-1/4 p-4 text-right md:w-1/5">
              <div className="hidden flex-col items-end space-y-2 md:flex">
                <p className="text-sm opacity-80">
                  {toDateText(props.notification.createdAt)}
                </p>
                <Badge variant="default">返信</Badge>
              </div>
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 返信がある場合 */}
          {reply && (
            <TableRow className="border-gray-200 border-t bg-zinc-50 dark:border-gray-700 dark:bg-zinc-700">
              <TableCell colSpan={3} className="p-4">
                <div className="flex items-start space-x-2">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={withIconUrlFallback(reply.user?.iconUrl)}
                      alt="reply user icon"
                    />
                    <AvatarFallback />
                  </Avatar>
                  <div className="flex-1 border-gray-400 border-l-2 pl-2">
                    <div className="flex items-center space-x-2">
                      <ReplyIcon className="size-5 " />
                      <p className="font-medium text-sm">
                        {reply.user?.name} が返信しました
                      </p>
                    </div>
                    <p className="mt-1 text-sm">
                      {reply.message && `「${reply.message}」`}
                    </p>
                    {reply.sticker?.imageUrl && (
                      <img
                        src={reply.sticker.imageUrl}
                        alt="reply sticker"
                        className={cn(stickerClass, "mt-2")}
                      />
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex space-x-2 p-2 md:hidden">
        <p className="text-sm opacity-80">
          {toDateText(props.notification.createdAt)}
        </p>
      </div>
    </div>
  )
}

export const WorkCommentReplyNotificationFragment = graphql(
  `fragment WorkCommentReplyNotification on WorkCommentReplyNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      id
      smallThumbnailImageURL
    }
    user {
      id
      name
      iconUrl
    }
    sticker {
      id
      imageUrl
    }
    comment {
      id
      createdAt
      text
      work {
        id
        smallThumbnailImageURL
      }
      user {
        id
        name
        iconUrl
      }
      sticker {
        id
        imageUrl
      }
    }
  }`,
)
