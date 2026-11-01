import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  userId: string
  userName: string
}

/**
 * 作品のすぐ下（作者名の横）のフォローボタン
 * スマホでは作者のカードがコメントの下にあって見つけにくいので、見ている作品の近くでフォローできるようにする
 */
export function WorkAuthorFollowButton(props: Props) {
  const authContext = useContext(AuthContext)

  const { data } = useQuery(workAuthorQuery, {
    skip: authContext.isLoading || authContext.userId === null,
    variables: { id: props.userId },
  })

  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false)

  if (authContext.userId === props.userId) {
    return null
  }

  return (
    <>
      <div className="w-28 shrink-0">
        <FollowButton
          targetUserId={props.userId}
          targetUserName={props.userName}
          isFollow={data?.user?.isFollowee ?? false}
          isFollower={data?.user?.isFollower ?? false}
          onFollowChange={setIsShowingSuggestions}
        />
      </div>
      {isShowingSuggestions && (
        <FollowSuggestions
          className="basis-full"
          userId={props.userId}
          userName={props.userName}
          onClose={() => setIsShowingSuggestions(false)}
        />
      )}
    </>
  )
}

/**
 * 作者のカード（WorkUser）と同じ形にして、1 回の読み込みで済ませる
 */
const workAuthorQuery = graphql(
  `query User($id: ID!) {
    user(id: $id) {
      id
      isFollowee
      isFollower
    }
  }`,
)
