import { PromptonRequestButton } from "@/[lang]/(main)/works/[work]/_components/prompton-request-button"
import { WorkAction } from "@/[lang]/(main)/works/[work]/_components/work-action"
import WorkArticleTags from "@/[lang]/(main)/works/[work]/_components/work-article-tags"
import { WorkImageView } from "@/[lang]/(main)/works/[work]/_components/work-image-view"
import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import type { WorkQuery } from "@/_graphql/__generated__/graphql"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { Link } from "@remix-run/react"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  return (
    <article className="flex flex-col space-y-4">
      <WorkImageView
        workImageURL={props.work.imageURL}
        subWorkImageURLs={props.work.subWorks.map((subWork) => {
          return subWork.image.downloadURL
        })}
      />
      <WorkAction
        workLikesCount={props.work.likesCount}
        title={props.work.title}
        imageUrl={props.work.imageURL}
      />
      <h1 className="font-bold text-lg">{props.work.title}</h1>
      <div className="flex flex-col space-y-2">
        <span className="text-sm">{"使用モデル名"}</span>
        <span className="text-sm">{toDateTimeText(props.work.createdAt)}</span>
        <span className="text-sm">{"デイリー入賞"}</span>
        {props.work.dailyTheme && (
          <div className="flex items-center">
            <span className="text-sm">{"参加お題:"}</span>
            <Button variant={"link"}>{props.work.dailyTheme.title}</Button>
          </div>
        )}
        <WorkArticleTags tagNames={props.work.tagNames} />
      </div>
      <p className="overflow-hidden whitespace-pre-wrap break-words">
        {props.work.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <Link to={`/users/${props.work.user.login}`}>
              <AvatarImage src={props.work.user.iconImage?.downloadURL} />
              <AvatarFallback />
            </Link>
          </Avatar>
          <span>{props.work.user.name}</span>
          <FollowButton />
          <PromptonRequestButton />
        </div>
        {/* <p className="text-sm">{"一覧をダイアログで見る"}</p> */}
      </div>
    </article>
  )
}
