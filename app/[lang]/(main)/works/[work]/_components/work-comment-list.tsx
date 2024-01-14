"use client"

import type { WorkCommentsQuery } from "@/graphql/__generated__/graphql"
import { StampDialog } from "@/app/[lang]/(main)/works/[work]/_components/stamp-dialog"
import { WorkComment } from "@/app/[lang]/(main)/works/[work]/_components/work-comment"
import { WorkCommentResponse } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-response"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StampIcon } from "lucide-react"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  work: NonNullable<WorkCommentsQuery["work"]>
}

/**
 * 作品へのコメント一覧
 */
export const WorkCommentList = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const appContext = useContext(AuthContext)

  return (
    <>
      <div className="space-y-4 w-full">
        <p>{"コメント"}</p>
        <div className="flex items-center space-x-2 w-full">
          <Avatar>
            <AvatarImage src={appContext.avatarPhotoURL ?? undefined} alt="" />
            <AvatarFallback />
          </Avatar>
          <Input type="text" placeholder="コメントする" />
          <Button size={"icon"} onClick={onOpen}>
            <StampIcon />
          </Button>
          <Button>{"投稿"}</Button>
        </div>
        <div className="space-y-8">
          {props.work.comments.map((comment) => (
            <div key={comment.id} className="space-y-8">
              <WorkComment
                createdAt={comment.createdAt}
                stickerImageURL={comment.sticker?.image?.downloadURL}
                text={comment.text}
                userIconImageURL={comment.user?.iconImage?.downloadURL}
                userName={comment.user?.name}
              />
              {comment.responses.map((reply) => (
                <WorkCommentResponse
                  key={reply.id}
                  createdAt={reply.createdAt}
                  stickerImageURL={reply.sticker?.image?.downloadURL}
                  text={reply.text}
                  userIconImageURL={reply.user?.iconImage?.downloadURL}
                  userName={reply.user?.name}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <StampDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
