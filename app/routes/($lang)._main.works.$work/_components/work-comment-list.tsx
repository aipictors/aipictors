import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { AuthContext } from "@/_contexts/auth-context"
import type { WorkCommentsQuery } from "@/_graphql/__generated__/graphql"
import { StampDialog } from "@/routes/($lang)._main.works.$work/_components/stamp-dialog"
import { WorkComment } from "@/routes/($lang)._main.works.$work/_components/work-comment"
import { WorkCommentResponse } from "@/routes/($lang)._main.works.$work/_components/work-comment-response"
import { StampIcon } from "lucide-react"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  comments: NonNullable<WorkCommentsQuery["work"]>["comments"]
}

/**
 * 作品へのコメント一覧
 */
export const WorkCommentList = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const appContext = useContext(AuthContext)

  return (
    <>
      <div className="space-y-4 pt-2">
        <p>{"コメント"}</p>
        <div className="flex w-full items-center space-x-2">
          <Avatar>
            <AvatarImage src={appContext.avatarPhotoURL ?? undefined} alt="" />
            <AvatarFallback />
          </Avatar>
          <Input type="text" placeholder="コメントする" />
          <div>
            <Button size={"icon"} onClick={onOpen}>
              <StampIcon />
            </Button>
          </div>
          <Button>{"送信"}</Button>
        </div>
        <div className="space-y-8">
          {props.comments.map((comment) => (
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