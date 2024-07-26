import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { StickerDialog } from "@/routes/($lang)._main.posts.$post/_components/sticker-dialog"
import { WorkComment } from "@/routes/($lang)._main.posts.$post/_components/work-comment"
import { WorkCommentResponse } from "@/routes/($lang)._main.posts.$post/_components/work-comment-response"
import { Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useState } from "react"
import { useBoolean } from "usehooks-ts"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { type FragmentOf, graphql } from "gql.tada"
import { IconUrl } from "@/_components/icon-url"
import { ExpansionTransition } from "@/_components/expansion-transition"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { commentFieldsFragment } from "@/_graphql/fragments/comment-fields"

type Props = {
  workId: string
  comments: FragmentOf<typeof commentFragment>[]
}

// コメント
type Comment = {
  id: string
  text: string
  createdAt: number
  user: {
    id: string
    name: string
    iconUrl: string
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

// 返信コメント
type ReplyComment = {
  replyTargetId: string
  id: string
  text: string
  createdAt: number
  user: {
    id: string
    name: string
    iconUrl: string
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

/**
 * 作品へのコメント一覧
 */
export const WorkCommentList = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const appContext = useContext(AuthContext)

  const [createWorkComment, { loading: isCreatingWorkComment }] = useMutation(
    createWorkCommentMutation,
  )

  // 入力中のコメント
  const [comment, setComment] = useState("")

  // 新しく追加したコメント
  const [newComments, setNewComments] = useState<[Comment] | null>(null)

  // 新しく追加した返信
  const [newReplyComments, setNewReplyComments] = useState<
    [ReplyComment] | null
  >(null)

  // 非表示にしたコメントID一覧（コメント削除を行ったときに追加される）
  const [hideCommentIds, setHideCommentIds] = useState<string[]>([])

  // コメント一覧（返信、新しく追加したコメントを除く）
  const showComments = props.comments.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const authContext = useContext(AuthContext)

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId ?? "0",
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      bookmarksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  const userIcon = userResp?.data?.user?.iconUrl

  // 表示する新しく追加したコメント
  const showNewComments = newComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  // 表示する返信コメント
  const showNewReplyComments = newReplyComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  /**
   * コメント送信イベント（スタンプボタン押下も含む）
   * @param text
   * @param stickerId
   * @param stickerImageURL
   * @param targetWorkId
   */
  const sendComment = async (
    text: string,
    stickerId: string,
    stickerImageURL: string,
    targetWorkId: string,
    iconUrl: string | null | undefined = null,
  ) => {
    try {
      if (targetWorkId !== undefined) {
        const res = await createWorkComment({
          variables: {
            input: {
              workId: targetWorkId,
              text: text,
              stickerId: stickerId,
            },
          },
        })

        setComment("")

        setNewComments([
          {
            id: res.data?.createWorkComment?.id ?? "",
            text: text,
            createdAt: new Date().getTime(),
            user: {
              id: appContext.userId ?? "",
              name: appContext.displayName ?? "",
              iconUrl: IconUrl(iconUrl),
            },
            sticker: {
              image: {
                downloadURL: stickerImageURL,
              },
            },
            ...newComments,
          },
        ])
      }
    } catch (e) {
      toast(
        "送信に失敗しました。同じコメントを何度も送信しようとしているか、通信エラーが発生しています。",
      )
    }
  }

  /**
   * コメント削除を成功したときの処理
   * @param commentId
   */
  const onDeleteComment = (commentId: string) => {
    // 非表示にするコメントIDを追加
    setHideCommentIds([...hideCommentIds, commentId])
  }

  /**
   * 作品へのコメント送信イベント（返信は除く）
   */
  const onWorkComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast("コメントを入力してください")
      return
    }

    sendComment(inputComment, "-1", "", props.workId, userIcon)
  }

  // もっと見るを表示する前のコメント一覧、showCommentsから8件まで表示
  const showCommentsBeforeMore = showComments.slice(0, 8)

  // もっと見る以降のコメント一覧、showCommentsから8件以降を表示
  const showCommentsAfterMore = showComments.slice(8)

  return (
    <>
      {/* コメント一覧 */}
      <div className="space-y-4 pt-2">
        <p>{`コメント (${showComments.length + (showNewComments?.length ?? 0)})`}</p>
        {/* コメント入力欄 */}
        <div className="flex w-full items-center space-x-2">
          <Avatar>
            <AvatarImage src={appContext.avatarPhotoURL ?? undefined} alt="" />
            <AvatarFallback />
          </Avatar>
          <AutoResizeTextarea
            onChange={(event) => {
              setComment(event.target.value)
            }}
            value={comment}
            placeholder="コメントする"
          />
          <div>
            <Button variant={"secondary"} size={"icon"} onClick={onOpen}>
              <StampIcon />
            </Button>
          </div>
          {isCreatingWorkComment ? (
            <Button onClick={() => {}}>
              <Loader2Icon className={"animate-spin"} />
            </Button>
          ) : (
            <Button variant={"secondary"} onClick={onWorkComment}>
              {"送信"}
            </Button>
          )}
        </div>
        <div className="space-y-8">
          {/* 新しくコメント追加したコメント一覧 */}
          {showNewComments && (
            <div className="space-y-8">
              {showNewComments.map((comment) => (
                <div key={comment.id}>
                  <WorkComment
                    userId={comment.user?.id ?? ""}
                    isMine={comment.user?.id === appContext.userId}
                    createdAt={comment.createdAt}
                    stickerImageURL={comment.sticker?.image?.downloadURL}
                    text={comment.text}
                    userIconImageURL={IconUrl(userIcon)}
                    userName={comment.user?.name}
                    commentId={comment.id}
                    onDeleteComment={() => onDeleteComment(comment.id)}
                    onReplyCompleted={(
                      id: string,
                      text: string,
                      stickerId: string,
                      stickerImageURL: string,
                    ) => {
                      // 表示コメントを追加
                      setNewComments([
                        {
                          id: id,
                          text: text,
                          createdAt: new Date().getTime(),
                          user: {
                            id: appContext.userId ?? "",
                            name: appContext.displayName ?? "",
                            iconUrl: IconUrl(userIcon),
                          },
                          sticker: {
                            image: {
                              downloadURL: stickerImageURL,
                            },
                          },
                          ...newComments,
                        },
                      ])
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {/* 既にコメント済みのコメント一覧 */}
          {showCommentsBeforeMore.map((comment) => (
            <div key={comment.id} className="space-y-8">
              {/* 作品へのコメント内容 */}
              <WorkComment
                userId={comment.user?.id ?? ""}
                isMine={comment.user?.id === appContext.userId}
                createdAt={comment.createdAt}
                stickerImageURL={comment.sticker?.imageUrl ?? ""}
                stickerTitle={comment.sticker?.title}
                stickerId={comment.sticker?.id}
                stickerAccessType={comment.sticker?.accessType}
                isStickerDownloadable={comment.sticker?.isDownloaded}
                text={comment.text}
                userIconImageURL={IconUrl(comment.user?.iconUrl)}
                userName={comment.user?.name}
                commentId={comment.id}
                onDeleteComment={() => onDeleteComment(comment.id)}
                onReplyCompleted={(
                  id: string,
                  text: string,
                  stickerId: string,
                  stickerImageURL: string,
                ) => {
                  // 表示コメントを追加
                  setNewReplyComments([
                    {
                      replyTargetId: comment.id,
                      id: id,
                      text: text,
                      createdAt: new Date().getTime(),
                      user: {
                        id: appContext.userId ?? "",
                        name: appContext.displayName ?? "",
                        iconUrl: IconUrl(userIcon),
                      },
                      sticker: {
                        image: {
                          downloadURL: stickerImageURL,
                        },
                      },
                      ...newComments,
                    },
                  ])
                }}
              />
              {/* コメントへの返信 */}
              {comment.responses
                .sort((a, b) => a.createdAt - b.createdAt)
                .filter((reply) => !hideCommentIds.includes(reply.id))
                .map((reply) => (
                  <WorkCommentResponse
                    key={reply.id}
                    userId={reply.user?.id ?? ""}
                    isMine={reply.user?.id === appContext.userId}
                    createdAt={reply.createdAt}
                    stickerImageURL={reply.sticker?.imageUrl ?? ""}
                    stickerTitle={reply.sticker?.title}
                    stickerId={reply.sticker?.id}
                    stickerAccessType={reply.sticker?.accessType}
                    isStickerDownloadable={reply.sticker?.isDownloaded}
                    text={reply.text}
                    userIconImageURL={IconUrl(reply.user?.iconUrl)}
                    userName={reply.user?.name}
                    replyId={reply.id}
                    iconUrl={IconUrl(userIcon)}
                    onDeleteComment={() => {
                      onDeleteComment(reply.id)
                    }}
                    onReplyCompleted={(
                      id: string,
                      text: string,
                      stickerId: string,
                      stickerImageURL: string,
                    ) => {
                      // 表示コメントを追加
                      setNewReplyComments([
                        {
                          replyTargetId: comment.id,
                          id: id,
                          text: text,
                          createdAt: new Date().getTime(),
                          user: {
                            id: appContext.userId ?? "",
                            name: appContext.displayName ?? "",
                            iconUrl: IconUrl(userIcon),
                          },
                          sticker: {
                            image: {
                              downloadURL: stickerImageURL,
                            },
                          },
                          ...newReplyComments,
                        },
                      ])
                    }}
                  />
                ))}
              {/* 新しく追加した返信への返信 */}
              {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
              {showNewReplyComments &&
                showNewReplyComments.map((newReply) =>
                  newReply.replyTargetId !== comment.id ? null : (
                    <WorkCommentResponse
                      key={newReply.id}
                      userId={newReply.user?.id ?? ""}
                      isMine={newReply.user?.id === appContext.userId}
                      createdAt={newReply.createdAt}
                      stickerImageURL={newReply.sticker?.image?.downloadURL}
                      text={newReply.text}
                      iconUrl={IconUrl(userIcon)}
                      userName={newReply.user?.name}
                      replyId={newReply.id}
                      onDeleteComment={() => {
                        onDeleteComment(newReply.id)
                      }}
                    />
                  ),
                )}
            </div>
          ))}
          {/* もっと見るで確認できる既にコメント済みのコメント一覧 */}
          {showCommentsAfterMore.length > 8 && (
            <ExpansionTransition
              triggerChildren={
                <Button className="w-full" variant={"secondary"}>
                  もっと見る({showComments.length - 8})
                </Button>
              }
              oneTimeExpand={true}
            >
              {showCommentsAfterMore.map((comment) => (
                <div key={comment.id} className="space-y-8">
                  {/* 作品へのコメント内容 */}
                  <WorkComment
                    userId={comment.user?.id ?? ""}
                    isMine={comment.user?.id === appContext.userId}
                    createdAt={comment.createdAt}
                    stickerImageURL={comment.sticker?.imageUrl ?? ""}
                    stickerTitle={comment.sticker?.title}
                    stickerId={comment.sticker?.id}
                    stickerAccessType={comment.sticker?.accessType}
                    isStickerDownloadable={comment.sticker?.isDownloaded}
                    text={comment.text}
                    userIconImageURL={IconUrl(comment.user?.iconUrl)}
                    userName={comment.user?.name}
                    commentId={comment.id}
                    onDeleteComment={() => onDeleteComment(comment.id)}
                    onReplyCompleted={(
                      id: string,
                      text: string,
                      stickerId: string,
                      stickerImageURL: string,
                    ) => {
                      // 表示コメントを追加
                      setNewReplyComments([
                        {
                          replyTargetId: comment.id,
                          id: id,
                          text: text,
                          createdAt: new Date().getTime(),
                          user: {
                            id: appContext.userId ?? "",
                            name: appContext.displayName ?? "",
                            iconUrl: IconUrl(userIcon),
                          },
                          sticker: {
                            image: {
                              downloadURL: stickerImageURL,
                            },
                          },
                          ...newComments,
                        },
                      ])
                    }}
                  />
                  {/* コメントへの返信 */}
                  {comment.responses
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .filter((reply) => !hideCommentIds.includes(reply.id))
                    .map((reply) => (
                      <WorkCommentResponse
                        key={reply.id}
                        userId={reply.user?.id ?? ""}
                        isMine={reply.user?.id === appContext.userId}
                        createdAt={reply.createdAt}
                        stickerImageURL={reply.sticker?.imageUrl ?? ""}
                        stickerTitle={reply.sticker?.title}
                        stickerId={reply.sticker?.id}
                        stickerAccessType={reply.sticker?.accessType}
                        isStickerDownloadable={reply.sticker?.isDownloaded}
                        text={reply.text}
                        userIconImageURL={IconUrl(reply.user?.iconUrl)}
                        userName={reply.user?.name}
                        replyId={reply.id}
                        iconUrl={IconUrl(userIcon)}
                        onDeleteComment={() => {
                          onDeleteComment(reply.id)
                        }}
                        onReplyCompleted={(
                          id: string,
                          text: string,
                          stickerId: string,
                          stickerImageURL: string,
                        ) => {
                          // 表示コメントを追加
                          setNewReplyComments([
                            {
                              replyTargetId: comment.id,
                              id: id,
                              text: text,
                              createdAt: new Date().getTime(),
                              user: {
                                id: appContext.userId ?? "",
                                name: appContext.displayName ?? "",
                                iconUrl: IconUrl(userIcon),
                              },
                              sticker: {
                                image: {
                                  downloadURL: stickerImageURL,
                                },
                              },
                              ...newReplyComments,
                            },
                          ])
                        }}
                      />
                    ))}
                  {/* 新しく追加した返信への返信 */}
                  {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
                  {showNewReplyComments &&
                    showNewReplyComments.map((newReply) =>
                      newReply.replyTargetId !== comment.id ? null : (
                        <WorkCommentResponse
                          key={newReply.id}
                          userId={newReply.user?.id ?? ""}
                          isMine={newReply.user?.id === appContext.userId}
                          createdAt={newReply.createdAt}
                          stickerImageURL={newReply.sticker?.image?.downloadURL}
                          text={newReply.text}
                          userIconImageURL={IconUrl(newReply.user?.iconUrl)}
                          userName={newReply.user?.name}
                          replyId={newReply.id}
                          iconUrl={IconUrl(userIcon)}
                          onDeleteComment={() => {
                            onDeleteComment(newReply.id)
                          }}
                        />
                      ),
                    )}
                </div>
              ))}
            </ExpansionTransition>
          )}
        </div>
      </div>
      {/* スタンプ送信ダイアログ */}
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, url: string) => {
          await sendComment(comment, stickerId, url, props.workId)
        }}
      />
    </>
  )
}

export const workCommentUserFragment = graphql(
  `fragment WorkCommentUser on UserNode @_unmask {
    id
    biography
    createdBookmarksCount
    login
    nanoid
    name
    receivedLikesCount
    receivedViewsCount
    awardsCount
    followCount
    followersCount
    worksCount
    iconUrl
    headerImageUrl
    webFcmToken
    isFollower
    isFollowee
    headerImageUrl
    biography
    enBiography
    instagramAccountId
    twitterAccountId
    githubAccountId
    siteURL
    mailAddress
    promptonUser {
      id
    }
  }`,
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $worksOffset: Int!,
    $worksLimit: Int!,
    $worksWhere: UserWorksWhereInput,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
    $followersWorksWhere: UserWorksWhereInput,
    $bookmarksOffset: Int!,
    $bookmarksLimit: Int!,
    $bookmarksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      ...WorkCommentUser
      works(offset: $worksOffset, limit: $worksLimit, where: $worksWhere) {
        ...PartialWorkFields
      }
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
          ...PartialWorkFields
        }
      }
      followers(offset: $followersOffset, limit: $followersLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...PartialWorkFields
        }
      }
      bookmarkWorks(offset: $bookmarksOffset, limit: $bookmarksLimit, where: $bookmarksWhere) {
        ...PartialWorkFields
      }
      featuredSensitiveWorks {
        ...PartialWorkFields
      }
      featuredWorks {
        ...PartialWorkFields
      }
    }
  }`,
  [workCommentUserFragment, partialWorkFieldsFragment],
)

export const commentFragment = graphql(
  `fragment Comment on CommentNode @_unmask {
      ...CommentFields
      responses(offset: 0, limit: 128) {
        ...CommentFields
      }
  }`,
  [commentFieldsFragment],
)

const createWorkCommentMutation = graphql(
  `mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }`,
)
