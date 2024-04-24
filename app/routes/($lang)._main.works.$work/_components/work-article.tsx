import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import type { WorkQuery } from "@/_graphql/__generated__/graphql"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { PromptonRequestButton } from "@/routes/($lang)._main.works.$work/_components/prompton-request-button"
import { WorkAction } from "@/routes/($lang)._main.works.$work/_components/work-action"
import WorkArticleTags from "@/routes/($lang)._main.works.$work/_components/work-article-tags"
import { WorkImageView } from "@/routes/($lang)._main.works.$work/_components/work-image-view"
import { Link } from "@remix-run/react"
import {} from "@apollo/client/index.js"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  return (
    <article className="flex flex-col">
      <img
        alt=""
        src="https://www.aipictors.com/wp-content/uploads/2022/12/Qg62jAX3CzJyVchs0nRBUiZb97vNST.png"
      />
      <WorkImageView
        workImageURL={props.work.imageURL}
        subWorkImageURLs={props.work.subWorks.map((subWork) => {
          return subWork.image.downloadURL
        })}
      />
      <section className="mt-4 space-y-4">
        <WorkAction
          workLikesCount={props.work.likesCount}
          title={props.work.title}
          imageUrl={props.work.imageURL}
          defaultLiked={props.work.isLiked}
          targetWorkId={props.work.id}
          targetWorkOwnerUserId={props.work.user.id}
        />
        <h1 className="font-bold text-lg">{props.work.title}</h1>
        <div className="flex flex-col space-y-2">
          <span className="text-sm">
            {"使用モデル名:"}
            <a
              href={`https://www.aipictors.com/search/?ai=${props.work.model}`}
            >
              {props.work.model}
            </a>
          </span>
          <span className="text-sm">
            {toDateTimeText(props.work.createdAt)}
          </span>
          {props.work.dailyRanking && (
            <span className="text-sm">{`デイリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.weeklyRanking && (
            <span className="text-sm">{`ウィークリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.monthlyRanking && (
            <span className="text-sm">{`マンスリー入賞 ${props.work.dailyRanking} 位`}</span>
          )}
          {props.work.dailyTheme && (
            <div className="flex items-center">
              <span className="text-sm">{"参加お題:"}</span>
              <a
                href={`https://www.aipictors.com/search?word=${props.work.dailyTheme.title}`}
              >
                <Button variant={"link"}>{props.work.dailyTheme.title}</Button>
              </a>
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
            {props.work.user.promptonUser && (
              <PromptonRequestButton
                promptonId={props.work.user.promptonUser.id}
              />
            )}
          </div>
        </div>
      </section>
    </article>
  )
}
