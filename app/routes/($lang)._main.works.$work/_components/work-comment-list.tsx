import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { AuthContext } from "@/_contexts/auth-context"
import type { WorkCommentsQuery } from "@/_graphql/__generated__/graphql"
import { StickerDialog } from "@/routes/($lang)._main.works.$work/_components/sticker-dialog"
import { WorkComment } from "@/routes/($lang)._main.works.$work/_components/work-comment"
import { WorkCommentResponse } from "@/routes/($lang)._main.works.$work/_components/work-comment-response"
import { Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useState } from "react"
import { useBoolean } from "usehooks-ts"
import { useMutation } from "@apollo/client/index"
import { createWorkCommentMutation } from "@/_graphql/mutations/create-work-comment"
import { toast } from "sonner"

type Props = {
  workId: string
  comments: NonNullable<WorkCommentsQuery["work"]>["comments"]
}

// コメント
type Comment = {
  id: string
  text: string
  createdAt: number
  user: {
    id: string
    name: string
    iconImage: {
      downloadURL: string
    }
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
    iconImage: {
      downloadURL: string
    }
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
              iconImage: {
                downloadURL: appContext.avatarPhotoURL ?? "",
              },
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

    sendComment(inputComment, "-1", "", props.workId)
  }

  return (
    <>
      {/* コメント一覧 */}
      <div className="space-y-4 pt-2">
        <p>{"コメント"}</p>
        {/* コメント入力欄 */}
        <div className="flex w-full items-center space-x-2">
          <Avatar>
            <AvatarImage src={appContext.avatarPhotoURL ?? undefined} alt="" />
            <AvatarFallback />
          </Avatar>
          <Input
            onChange={(event) => {
              setComment(event.target.value)
            }}
            type="text"
            value={comment}
            placeholder="コメントする"
          />
          <div>
            <Button size={"icon"} onClick={onOpen}>
              <StampIcon />
            </Button>
          </div>
          {isCreatingWorkComment ? (
            <Button onClick={() => {}}>
              <Loader2Icon className={"animate-spin"} />
            </Button>
          ) : (
            <Button onClick={onWorkComment}>{"送信"}</Button>
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
                    userIconImageURL={comment.user?.iconImage?.downloadURL}
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
                            iconImage: {
                              downloadURL: appContext.avatarPhotoURL ?? "",
                            },
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
          {showComments.map((comment) => (
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
                userIconImageURL={comment.user?.iconImage?.downloadURL}
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
                        iconImage: {
                          downloadURL: appContext.avatarPhotoURL ?? "",
                        },
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
                .map((reply) =>
                  // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                  hideCommentIds.find((id) => id === reply.id) ? null : (
                    <WorkCommentResponse
                      key={reply.id}
                      userId={reply.user?.id ?? ""}
                      isMine={reply.user?.id === appContext.userId}
                      createdAt={reply.createdAt}
                      stickerImageURL={reply.sticker?.imageUrl ?? ""}
                      stickerTitle={reply.sticker?.title}
                      stickerId={reply.sticker?.id}
                      stickerAccessType={comment.sticker?.accessType}
                      isStickerDownloadable={reply.sticker?.isDownloaded}
                      text={reply.text}
                      userIconImageURL={reply.user?.iconImage?.downloadURL}
                      userName={reply.user?.name}
                      replyId={reply.id}
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
                              iconImage: {
                                downloadURL: appContext.avatarPhotoURL ?? "",
                              },
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
                  ),
                )}
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
                      userIconImageURL={newReply.user?.iconImage?.downloadURL}
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
