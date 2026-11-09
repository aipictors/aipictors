import { toResizedImageUrl } from "~/utils/resized-image-url"
import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { containsJapanese, useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  /** R18 のページ（リンクを /r に） */
  isSensitive?: boolean
  comments: FragmentOf<typeof HomeNewCommentsFragment>[]
}

/**
 * 新規コメント一覧（テキストのみに絞り込み）
 */
export function HomeNewCommentsSection(props: Props) {
  const t = useTranslation()

  // コメントは毎回翻訳すると翻訳の回数の上限に届くので、英語の画面では日本語のものを出さない
  const comments = readFragment(HomeNewCommentsFragment, props.comments).filter(
    (comment) =>
      !t.isEnglish || !containsJapanese(comment.comment?.text ?? ""),
  )

  if (comments.length === 0) {
    return null
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-sm">
          {t("新規コメント", "New Comments")}
        </h2>
        <Link
          to={`${props.isSensitive ? "/r" : ""}/comments/new`}
          className="flex shrink-0 items-center text-muted-foreground text-xs hover:text-foreground"
        >
          {t("もっと見る", "View More")}
          <ChevronRightIcon className="size-3.5" />
        </Link>
      </div>

      <ul className="-mx-2">
        {comments.map((comment) => {
          const work = comment.work
          if (!work?.smallThumbnailImageURL) {
            return null
          }
          return (
            <li key={comment.comment?.id}>
              <Link
                to={`${props.isSensitive ? "/r" : ""}/posts/${work.id}`}
                title={t.workTitle(work.title, work.enTitle)}
                className="flex gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <img
                  src={toResizedImageUrl(work.smallThumbnailImageURL, 96)}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="size-12 shrink-0 rounded-lg object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words text-sm leading-snug">
                    {comment.comment?.text ?? ""}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="truncate">{comment.user?.name}</span>
                    <span className="shrink-0">
                      ·{" "}
                      {t(
                        toElapsedTimeText(comment.createdAt),
                        toElapsedTimeEnText(comment.createdAt),
                      )}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
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
      title
      enTitle
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
