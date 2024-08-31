import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  comments: FragmentOf<typeof HomeNewCommentsFragment>[]
}

/**
 * 新規ユーザ一覧
 */
export function HomeNewCommentsSection(props: Props) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-semibold">新規コメント</h2>
      {props.comments.map((comment) => (
        <div key={comment.comment?.id} className="flex items-center space-x-2">
          {comment.work?.smallThumbnailImageURL && (
            <Link
              to={`/posts/${comment.work}`}
              className="flex items-center space-x-2"
            >
              <div className="opacity-60">
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
              </div>
              <div className="flex flex-col space-y-2">
                {comment.comment && comment.comment.text.length > 0 && (
                  <>
                    {comment.comment.text.length > 0 && (
                      <p>
                        <span className="line-clamp-2 font-semibold text-md">
                          {comment.comment.text}
                        </span>
                      </p>
                    )}
                    {comment.comment.text.length === 0 &&
                      comment.sticker?.imageUrl && (
                        <p>
                          <span className="line-clamp-2 font-semibold text-md">
                            {`スタンプ：「${comment.sticker.title.length > 0 ? comment.sticker.title : ""}」`}
                          </span>
                        </p>
                      )}
                  </>
                )}
                {comment.sticker?.imageUrl && (
                  <img
                    src={comment.sticker.imageUrl}
                    alt="sticker"
                    className="h-8 w-8 rounded-md opacity-60 md:h-12 md:w-12"
                  />
                )}
                <div className="text-sm opacity-60">
                  {toElapsedTimeText(comment.createdAt)}
                </div>
              </div>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

export const HomeNewCommentsFragment = graphql(
  `fragment HomeNewComments on NewCommentNode @_unmask {
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
