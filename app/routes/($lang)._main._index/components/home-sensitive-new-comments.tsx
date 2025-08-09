import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useContext } from "react"
import { Link } from "@remix-run/react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { Button } from "~/components/ui/button"
import { ExternalLink, Type } from "lucide-react"
import { Badge } from "~/components/ui/badge"

type Props = {
  comments: FragmentOf<typeof HomeNewCommentsFragment>[]
}

/**
 * 新規コメント一覧（テキストのみに絞り込み）
 */
export function HomeSensitiveNewCommentsSection(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const comments = readFragment(HomeNewCommentsFragment, props.comments)

  const { data: newCommentsRet } = useQuery(homeNewCommentsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const newComments = newCommentsRet?.newComments
    ? readFragment(HomeNewCommentsFragment, newCommentsRet?.newComments)
    : comments

  // テキストのみのコメントを絞り込み（GraphQLでフィルタが効かない場合のフォールバック）
  const textOnlyComments = newComments.filter(comment => 
    comment.comment?.text && comment.comment.text.trim().length > 0
  )

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{t("新規コメント", "New Comments")}</h2>
          <Badge variant="secondary" className="text-xs">
            <Type className="h-3 w-3 mr-1" />
            {t("テキストのみ", "Text Only")}
          </Badge>
        </div>
        <Link to="/r/comments/new">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            {t("もっと見る", "View More")}
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {t("テキストが入力されているコメントのみを表示しています", "Showing only comments with text content")}
      </p>
      
      {textOnlyComments.map((comment) => (
        <div
          key={comment.comment?.id}
          className="flex items-center space-x-2 opacity-80"
        >
          {comment.work?.smallThumbnailImageURL && (
            <div className="flex items-center space-x-2">
              <CroppedWorkSquare
                workId={comment.work.id}
                imageUrl={comment.work?.smallThumbnailImageURL}
                size="sm"
                thumbnailImagePosition={
                  comment.work?.thumbnailImagePosition ?? 0
                }
                imageWidth={comment.work?.smallThumbnailImageWidth}
                imageHeight={comment.work?.smallThumbnailImageHeight}
              />
              <div className="flex flex-col space-y-2">
                {comment.comment && comment.comment.text.length > 0 && (
                  <p>
                    <span className="line-clamp-2 text-md font-semibold">
                      {comment.comment.text}
                    </span>
                  </p>
                )}
                <div className="text-sm">
                  {t(
                    toElapsedTimeText(comment.createdAt),
                    toElapsedTimeEnText(comment.createdAt),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const HomeNewCommentsFragment = graphql(
  `fragment HomeNewComments on NewCommentNode {
    user {
      id
      name
      login
      iconUrl
    }
    sticker {
      id
      imageUrl
      title
    }
    work {
      id
      smallThumbnailImageURL
      smallThumbnailImageHeight
      smallThumbnailImageWidth
      thumbnailImagePosition
    }
    comment {
      id
      text
    }
    createdAt
  }`,
)

const homeNewCommentsQuery = graphql(
  `query HomeNewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: true,
        ratings: [R18, R18G],
        isTextOnly: true
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
