"use client"

import type { WorkCommentsQuery } from "@/__generated__/apollo"
import { StampDialog } from "@/app/[lang]/(main)/works/[work]/_components/stamp-dialog"
import { WorkComment } from "@/app/[lang]/(main)/works/[work]/_components/work-comment"
import { WorkCommentResponse } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-response"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stamp } from "lucide-react"
import { useBoolean } from "usehooks-ts"

type Props = {
  work: NonNullable<WorkCommentsQuery["work"]>
}

export const WorkCommentList = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <div className="space-y-4 w-full">
        <p>{"コメント"}</p>
        <div className="flex items-center space-x-2 w-full">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="自分のアバターアイコン"
            />
          </Avatar>
          <Input type="text" placeholder="コメントする" className="flex-1" />
          <Button size={"icon"} onClick={onOpen}>
            <Stamp />
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
