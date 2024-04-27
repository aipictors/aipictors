import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import type { WorkQuery } from "@/_graphql/__generated__/graphql"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { PromptonRequestButton } from "@/routes/($lang)._main.works.$work/_components/prompton-request-button"
import { WorkAction } from "@/routes/($lang)._main.works.$work/_components/work-action"
import { WorkArticleTags } from "@/routes/($lang)._main.works.$work/_components/work-article-tags"
import { WorkImageView } from "@/routes/($lang)._main.works.$work/_components/work-image-view"
import { Link } from "@remix-run/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { useState } from "react"
import { Card } from "@/_components/ui/card"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  const [viewGenerationType, setViewGenerationType] = useState("prompt")

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

        <Tabs value={viewGenerationType}>
          <TabsList className="w-full max-w-[320px] overflow-x-auto md:max-w-[100%]">
            {props.work.prompt && (
              <TabsTrigger
                onClick={() => {
                  setViewGenerationType("prompt")
                }}
                className="w-full"
                value="prompt"
              >
                Prompts
              </TabsTrigger>
            )}
            {props.work.negativePrompt && (
              <TabsTrigger
                onClick={() => {
                  setViewGenerationType("negativePrompt")
                }}
                className="w-full"
                value="negativePrompt"
              >
                NegativePrompts
              </TabsTrigger>
            )}
            {(props.work.steps ||
              props.work.scale ||
              props.work.seed ||
              props.work.sampler) && (
              <TabsTrigger
                onClick={() => {
                  setViewGenerationType("parameter")
                }}
                className="w-full"
                value="parameter"
              >
                Parameter
              </TabsTrigger>
            )}
            {props.work.otherGenerationParams && (
              <TabsTrigger
                onClick={() => {
                  setViewGenerationType("other")
                }}
                className="w-full"
                value="other"
              >
                Other
              </TabsTrigger>
            )}
          </TabsList>
          {props.work.prompt && (
            <TabsContent value="prompt">
              <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
                {props.work.prompt}
              </Card>
            </TabsContent>
          )}
          {props.work.negativePrompt && (
            <TabsContent value="negativePrompt">
              <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
                {props.work.negativePrompt}
              </Card>
            </TabsContent>
          )}
          {(props.work.steps ||
            props.work.scale ||
            props.work.seed ||
            props.work.sampler) && (
            <TabsContent value="parameter">
              <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
                <div className="p-4">
                  <div className="flex flex-wrap justify-between">
                    <div className="flex flex-col">
                      <span className="text-center text-sm opacity-50">
                        Steps
                      </span>
                      <span className="text-center text-lg">
                        {props.work.steps}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-center text-sm opacity-50">
                        Scale
                      </span>
                      <span className="text-center text-lg">
                        {props.work.scale}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-center text-sm opacity-50">
                        Seed
                      </span>
                      <span className="text-center text-lg">
                        {props.work.seed}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-center text-sm opacity-50">
                        Sampler
                      </span>
                      <span className="text-center text-lg">
                        {props.work.sampler}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-center text-sm opacity-50">
                        Strength
                      </span>
                      <span className="text-center text-lg">
                        {props.work.strength}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
          {props.work.otherGenerationParams && (
            <TabsContent value="other">
              <Card className="m-0 max-h-32 overflow-y-auto whitespace-pre-wrap p-2">
                {props.work.otherGenerationParams}
              </Card>
            </TabsContent>
          )}
        </Tabs>

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
