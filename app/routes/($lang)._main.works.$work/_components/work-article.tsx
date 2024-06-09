import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { PromptonRequestButton } from "@/routes/($lang)._main.works.$work/_components/prompton-request-button"
import { WorkImageView } from "@/routes/($lang)._main.works.$work/_components/work-image-view"
import { Link } from "@remix-run/react"
import {} from "@/_components/ui/tabs"
import { WorkArticleGenerationParameters } from "@/routes/($lang)._main.works.$work/_components/work-article-generation-parameters"
import { WorkActionContainer } from "@/routes/($lang)._main.works.$work/_components/work-action-container"
import { Suspense } from "react"
import { WorkArticleTags } from "@/routes/($lang)._main.works.$work/_components/work-article-tags"
import type { workQuery } from "@/_graphql/queries/work/work"
import type { ResultOf } from "gql.tada"

type Props = {
  work: NonNullable<ResultOf<typeof workQuery>["work"]>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  return (
    <article className="flex flex-col">
      <WorkImageView
        workImageURL={props.work.imageURL}
        subWorkImageURLs={props.work.subWorks.map((subWork) => {
          return subWork.image.downloadURL
        })}
      />
      <section className="mt-4 space-y-4">
        {props.work.isGeneration && (
          <a href={`/generation?work=${props.work.id}`}>
            <Button variant={"secondary"} className="w-full">
              参照生成する
            </Button>
          </a>
        )}
        <Suspense>
          <WorkActionContainer
            workLikesCount={props.work.likesCount}
            title={props.work.title}
            imageUrl={props.work.imageURL}
            targetWorkId={props.work.id}
            targetWorkOwnerUserId={props.work.user.id}
          />
        </Suspense>
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

        <WorkArticleGenerationParameters
          prompt={props.work.prompt}
          negativePrompt={props.work.negativePrompt}
          steps={props.work.steps}
          scale={props.work.scale}
          seed={props.work.seed}
          sampler={props.work.sampler}
          strength={props.work.strength}
          otherGenerationParams={props.work.otherGenerationParams}
        />

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
