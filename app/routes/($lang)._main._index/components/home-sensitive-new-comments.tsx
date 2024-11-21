import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useContext } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  comments: FragmentOf<typeof HomeNewCommentsFragment>[]
}

/**
 * 新規コメント一覧
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

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-semibold">{t("新規コメント", "New Comments")}</h2>
      {newComments.map((comment) => (
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

const homeNewCommentsQuery = graphql(
  `query HomeNewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: true,
        ratings: [R18, R18G]
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
