import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  comments: FragmentOf<typeof HomeNewCommentsFragment>[]
}

/**
 * 新規ユーザ一覧
 */
export function HomeNewCommentsSection(props: Props) {
  const t = useTranslation()

  const comments = readFragment(HomeNewCommentsFragment, props.comments)

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-semibold">{t("新規コメント", "New Comments")}</h2>
      {comments.map((comment) => (
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
                            {t(
                              `スタンプ：「${comment.sticker.title.length > 0 ? comment.sticker.title : ""}」`,
                              `Sticker: "${comment.sticker.title.length > 0 ? comment.sticker.title : ""}"`,
                            )}
                          </span>
                        </p>
                      )}
                  </>
                )}
                {comment.sticker?.imageUrl && (
                  <img
                    src={comment.sticker.imageUrl}
                    alt="sticker"
                    className="h-8 w-8 rounded-md md:h-12 md:w-12"
                  />
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
